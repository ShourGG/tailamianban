package controller

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"terraria-api/utils"

	"github.com/gin-gonic/gin"
)

// InstallController 游戏安装控制器
type InstallController struct {
	installDir string
}

// NewInstallController 创建安装控制器
func NewInstallController() *InstallController {
	installDir := os.Getenv("TERRARIA_INSTALL_DIR")
	if installDir == "" {
		installDir = "./terraria_servers"
	}
	return &InstallController{
		installDir: installDir,
	}
}

// GameVersion 游戏版本信息
type GameVersion struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Type        string `json:"type"` // vanilla, tshock, tmodloader
	Description string `json:"description"`
	DownloadURL string `json:"download_url"`
	Size        string `json:"size"`
	Recommended bool   `json:"recommended"`
}

// GetVersions 获取可用的游戏版本列表
func (ic *InstallController) GetVersions(c *gin.Context) {
	versions := []GameVersion{
		{
			Name:        "TShock 5.2.0",
			Version:     "5.2.0",
			Type:        "tshock",
			Description: "TShock服务端 - 支持插件和管理命令（推荐）",
			DownloadURL: "https://github.com/Pryaxis/TShock/releases/download/v5.2.0/TShock-5.2.0-for-Terraria-1.4.4.9-linux-x64-Release.zip",
			Size:        "~15MB",
			Recommended: true,
		},
		{
			Name:        "TShock 4.5.20",
			Version:     "4.5.20",
			Type:        "tshock",
			Description: "TShock服务端 - 旧版稳定版",
			DownloadURL: "https://github.com/Pryaxis/TShock/releases/download/v4.5.20/TShock4.5.20_Terraria1.4.3.6.zip",
			Size:        "~12MB",
			Recommended: false,
		},
		{
			Name:        "官方原版服务端",
			Version:     "1.4.4.9",
			Type:        "vanilla",
			Description: "官方原版Terraria服务端 - 无插件支持",
			DownloadURL: "https://terraria.org/api/download/pc-dedicated-server/terraria-server-1449.zip",
			Size:        "~10MB",
			Recommended: false,
		},
		{
			Name:        "tModLoader",
			Version:     "2023.8",
			Type:        "tmodloader",
			Description: "tModLoader服务端 - 支持模组",
			DownloadURL: "https://github.com/tModLoader/tModLoader/releases/download/v2023.8.3.0/tModLoader.zip",
			Size:        "~50MB",
			Recommended: false,
		},
	}

	utils.ResponseSuccess(c, versions)
}

// InstallRequest 安装请求
type InstallRequest struct {
	Version     string `json:"version" binding:"required"`
	Type        string `json:"type" binding:"required"`
	DownloadURL string `json:"download_url" binding:"required"`
	Name        string `json:"name" binding:"required"`
}

// InstallGame 安装游戏服务器
func (ic *InstallController) InstallGame(c *gin.Context) {
	var req InstallRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ResponseError(c, "参数错误: "+err.Error())
		return
	}

	// 创建安装目录
	targetDir := filepath.Join(ic.installDir, fmt.Sprintf("%s-%s", req.Type, req.Version))
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		utils.ResponseError(c, "创建目录失败: "+err.Error())
		return
	}

	// 检查是否已安装
	if _, err := os.Stat(filepath.Join(targetDir, "TerrariaServer.exe")); err == nil {
		utils.ResponseSuccess(c, gin.H{
			"status":      "already_installed",
			"message":     "该版本已安装",
			"install_dir": targetDir,
		})
		return
	}

	// 开始下载
	zipFile := filepath.Join(targetDir, "download.zip")
	if err := ic.downloadFile(req.DownloadURL, zipFile); err != nil {
		utils.ResponseError(c, "下载失败: "+err.Error())
		return
	}

	// 解压文件
	if err := ic.unzip(zipFile, targetDir); err != nil {
		os.Remove(zipFile)
		utils.ResponseError(c, "解压失败: "+err.Error())
		return
	}

	// 删除zip文件
	os.Remove(zipFile)

	// 设置执行权限（Linux）
	if runtime.GOOS == "linux" {
		serverExe := filepath.Join(targetDir, "TerrariaServer.bin.x86_64")
		if _, err := os.Stat(serverExe); err == nil {
			os.Chmod(serverExe, 0755)
		}
	}

	utils.ResponseSuccess(c, gin.H{
		"status":      "success",
		"message":     "安装成功",
		"install_dir": targetDir,
		"version":     req.Version,
		"type":        req.Type,
	})
}

// GetInstallStatus 获取安装状态
func (ic *InstallController) GetInstallStatus(c *gin.Context) {
	// 扫描安装目录
	installedVersions := []map[string]string{}

	entries, err := os.ReadDir(ic.installDir)
	if err != nil {
		utils.ResponseSuccess(c, installedVersions)
		return
	}

	for _, entry := range entries {
		if entry.IsDir() {
			dirPath := filepath.Join(ic.installDir, entry.Name())
			// 检查是否包含服务器可执行文件
			if _, err := os.Stat(filepath.Join(dirPath, "TerrariaServer.exe")); err == nil {
				parts := strings.Split(entry.Name(), "-")
				if len(parts) >= 2 {
					installedVersions = append(installedVersions, map[string]string{
						"name":        entry.Name(),
						"type":        parts[0],
						"version":     strings.Join(parts[1:], "-"),
						"install_dir": dirPath,
					})
				}
			}
		}
	}

	utils.ResponseSuccess(c, installedVersions)
}

// UninstallGame 卸载游戏服务器
func (ic *InstallController) UninstallGame(c *gin.Context) {
	installDir := c.Query("install_dir")
	if installDir == "" {
		utils.ResponseError(c, "参数错误: install_dir不能为空")
		return
	}

	// 安全检查：确保路径在安装目录下
	if !strings.HasPrefix(installDir, ic.installDir) {
		utils.ResponseError(c, "非法路径")
		return
	}

	// 删除目录
	if err := os.RemoveAll(installDir); err != nil {
		utils.ResponseError(c, "卸载失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, gin.H{
		"message": "卸载成功",
	})
}

// downloadFile 下载文件
func (ic *InstallController) downloadFile(url, filepath string) error {
	// 创建文件
	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()

	// 发送GET请求
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("下载失败: HTTP %d", resp.StatusCode)
	}

	// 写入文件
	_, err = io.Copy(out, resp.Body)
	return err
}

// unzip 解压zip文件
func (ic *InstallController) unzip(zipFile, targetDir string) error {
	// 使用系统的unzip命令
	if runtime.GOOS == "linux" {
		cmd := exec.Command("unzip", "-o", zipFile, "-d", targetDir)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("解压失败: %s, %w", string(output), err)
		}
		return nil
	}

	// Windows下使用PowerShell
	if runtime.GOOS == "windows" {
		cmd := exec.Command("powershell", "-Command", fmt.Sprintf("Expand-Archive -Path '%s' -DestinationPath '%s' -Force", zipFile, targetDir))
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("解压失败: %s, %w", string(output), err)
		}
		return nil
	}

	return fmt.Errorf("不支持的操作系统: %s", runtime.GOOS)
}
