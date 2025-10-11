package controller

import (
	"path/filepath"
	"strconv"
	"terraria-api/app/service"
	"terraria-api/utils"

	"github.com/gin-gonic/gin"
)

// FileController 文件管理控制器
type FileController struct {
	fileService *service.FileService
}

// NewFileController 创建文件控制器
func NewFileController() *FileController {
	return &FileController{
		fileService: service.NewFileService(),
	}
}

// BrowseDirectory 浏览目录
func (fc *FileController) BrowseDirectory(c *gin.Context) {
	roomIdStr := c.Param("id")
	roomId, err := strconv.ParseUint(roomIdStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	path := c.Query("path")
	files, err := fc.fileService.BrowseDirectory(uint(roomId), path)
	if err != nil {
		utils.ResponseError(c, "浏览目录失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, files)
}

// ReadFile 读取文件
func (fc *FileController) ReadFile(c *gin.Context) {
	roomIdStr := c.Param("id")
	roomId, err := strconv.ParseUint(roomIdStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	path := c.Query("path")
	content, err := fc.fileService.ReadFile(uint(roomId), path)
	if err != nil {
		utils.ResponseError(c, "读取文件失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, gin.H{"content": content})
}

// SaveFile 保存文件
func (fc *FileController) SaveFile(c *gin.Context) {
	roomIdStr := c.Param("id")
	roomId, err := strconv.ParseUint(roomIdStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	var req struct {
		Path    string `json:"path" binding:"required"`
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ResponseError(c, "参数错误: "+err.Error())
		return
	}

	if err := fc.fileService.SaveFile(uint(roomId), req.Path, req.Content); err != nil {
		utils.ResponseError(c, "保存文件失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, gin.H{"message": "文件保存成功"})
}

// DeleteFile 删除文件
func (fc *FileController) DeleteFile(c *gin.Context) {
	roomIdStr := c.Param("id")
	roomId, err := strconv.ParseUint(roomIdStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	path := c.Query("path")
	if err := fc.fileService.DeleteFile(uint(roomId), path); err != nil {
		utils.ResponseError(c, "删除文件失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, gin.H{"message": "文件删除成功"})
}

// UploadFile 上传文件
func (fc *FileController) UploadFile(c *gin.Context) {
	roomIdStr := c.Param("id")
	roomId, err := strconv.ParseUint(roomIdStr, 10, 32)
	if err != nil {
		utils.ResponseError(c, "无效的房间ID")
		return
	}

	path := c.PostForm("path")
	file, err := c.FormFile("file")
	if err != nil {
		utils.ResponseError(c, "获取上传文件失败: "+err.Error())
		return
	}

	// 构造完整路径
	fullPath := filepath.Join(path, file.Filename)

	// 保存文件
	if err := fc.fileService.UploadFile(uint(roomId), fullPath, file); err != nil {
		utils.ResponseError(c, "上传文件失败: "+err.Error())
		return
	}

	utils.ResponseSuccess(c, gin.H{"message": "文件上传成功", "filename": file.Filename})
}
