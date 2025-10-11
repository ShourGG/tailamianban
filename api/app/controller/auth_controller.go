package controller

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthController struct{}

func NewAuthController() *AuthController {
	return &AuthController{}
}

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Captcha  struct {
		Token     string `json:"token"`
		Timestamp int64  `json:"timestamp"`
		Type      string `json:"type"`
	} `json:"captcha"`
}

// LoginResponse 登录响应
type LoginResponse struct {
	Token    string `json:"token"`
	Username string `json:"username"`
}

// Login 用户登录
func (ac *AuthController) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"code":    "400",
			"message": "参数错误",
			"data":    nil,
		})
		return
	}

	// 简单的用户名密码验证（生产环境应该使用数据库）
	// 默认用户名密码都是 CHENY/123456 或 admin/admin
	validUsers := map[string]string{
		"CHENY": "123456",
		"admin": "admin",
	}

	password, exists := validUsers[req.Username]
	if !exists || password != req.Password {
		c.JSON(http.StatusOK, gin.H{
			"code":    "401",
			"message": "账号或密码错误",
			"data":    nil,
		})
		return
	}

	// 生成token（简单的随机token，生产环境应该使用JWT）
	token := generateToken()

	// 返回成功响应
	c.JSON(http.StatusOK, gin.H{
		"code":    "0",
		"message": "success",
		"data": LoginResponse{
			Token:    token,
			Username: req.Username,
		},
	})
}

// generateToken 生成随机token
func generateToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
