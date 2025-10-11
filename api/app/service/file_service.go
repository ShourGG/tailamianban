package service

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"terraria-api/app/model"
	"terraria-api/utils"
	"time"
)

// FileService 文件管理服务
type FileService struct{}

// NewFileService 创建文件服务
func NewFileService() *FileService {
	return &FileService{}
}

// FileInfo 文件信息
type FileInfo struct {
	Name     string    `json:"name"`
	Path     string    `json:"path"`
	Size     int64     `json:"size"`
	IsDir    bool      `json:"isDir"`
	Modified time.Time `json:"modified"`
}

// BrowseDirectory 浏览目录
func (s *FileService) BrowseDirectory(roomId uint, path string) ([]FileInfo, error) {
	// 获取房间信息
	var room model.Room
	if err := utils.DB.First(&room, roomId).Error; err != nil {
		return nil, errors.New("房间不存在")
	}

	// 构造房间目录
	roomDir := filepath.Join("./servers", fmt.Sprintf("room_%d", roomId))
	
	// 构造完整路径
	fullPath := filepath.Join(roomDir, path)
	
	// 安全检查：确保路径在房间目录内
	if !strings.HasPrefix(fullPath, roomDir) {
		return nil, errors.New("非法路径")
	}

	// 读取目录
	entries, err := os.ReadDir(fullPath)
	if err != nil {
		return nil, err
	}

	// 构造返回数据
	var files []FileInfo
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}

		files = append(files, FileInfo{
			Name:     entry.Name(),
			Path:     filepath.Join(path, entry.Name()),
			Size:     info.Size(),
			IsDir:    entry.IsDir(),
			Modified: info.ModTime(),
		})
	}

	return files, nil
}

// ReadFile 读取文件
func (s *FileService) ReadFile(roomId uint, path string) (string, error) {
	// 获取房间信息
	var room model.Room
	if err := utils.DB.First(&room, roomId).Error; err != nil {
		return "", errors.New("房间不存在")
	}

	// 构造房间目录
	roomDir := filepath.Join("./servers", fmt.Sprintf("room_%d", roomId))
	
	// 构造完整路径
	fullPath := filepath.Join(roomDir, path)
	
	// 安全检查
	if !strings.HasPrefix(fullPath, roomDir) {
		return "", errors.New("非法路径")
	}

	// 读取文件
	content, err := os.ReadFile(fullPath)
	if err != nil {
		return "", err
	}

	return string(content), nil
}

// SaveFile 保存文件
func (s *FileService) SaveFile(roomId uint, path string, content string) error {
	// 获取房间信息
	var room model.Room
	if err := utils.DB.First(&room, roomId).Error; err != nil {
		return errors.New("房间不存在")
	}

	// 构造房间目录
	roomDir := filepath.Join("./servers", fmt.Sprintf("room_%d", roomId))
	
	// 构造完整路径
	fullPath := filepath.Join(roomDir, path)
	
	// 安全检查
	if !strings.HasPrefix(fullPath, roomDir) {
		return errors.New("非法路径")
	}

	// 确保目录存在
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	// 写入文件
	return os.WriteFile(fullPath, []byte(content), 0644)
}

// DeleteFile 删除文件
func (s *FileService) DeleteFile(roomId uint, path string) error {
	// 获取房间信息
	var room model.Room
	if err := utils.DB.First(&room, roomId).Error; err != nil {
		return errors.New("房间不存在")
	}

	// 构造房间目录
	roomDir := filepath.Join("./servers", fmt.Sprintf("room_%d", roomId))
	
	// 构造完整路径
	fullPath := filepath.Join(roomDir, path)
	
	// 安全检查
	if !strings.HasPrefix(fullPath, roomDir) {
		return errors.New("非法路径")
	}

	// 删除文件
	return os.Remove(fullPath)
}

// UploadFile 上传文件
func (s *FileService) UploadFile(roomId uint, path string, fileHeader *multipart.FileHeader) error {
	// 获取房间信息
	var room model.Room
	if err := utils.DB.First(&room, roomId).Error; err != nil {
		return errors.New("房间不存在")
	}

	// 构造房间目录
	roomDir := filepath.Join("./servers", fmt.Sprintf("room_%d", roomId))
	
	// 构造完整路径
	fullPath := filepath.Join(roomDir, path)
	
	// 安全检查
	if !strings.HasPrefix(fullPath, roomDir) {
		return errors.New("非法路径")
	}

	// 确保目录存在
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	// 打开上传的文件
	src, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// 创建目标文件
	dst, err := os.Create(fullPath)
	if err != nil {
		return err
	}
	defer dst.Close()

	// 复制文件内容
	_, err = io.Copy(dst, src)
	return err
}
