package utils

import (
	"github.com/gin-gonic/gin"
)

// Response 统一响应结构
type Response struct {
	Code string      `json:"code"`
	Data interface{} `json:"data"`
	Msg  string      `json:"msg"`
}

// ResponseSuccess 成功响应
func ResponseSuccess(c *gin.Context, data interface{}) {
	c.JSON(200, Response{
		Code: "0",
		Data: data,
		Msg:  "成功",
	})
}

// ResponseError 错误响应
func ResponseError(c *gin.Context, msg string) {
	c.JSON(200, Response{
		Code: "1",
		Data: nil,
		Msg:  msg,
	})
}

// ResponseErrorWithCode 带错误码的错误响应
func ResponseErrorWithCode(c *gin.Context, code string, msg string) {
	c.JSON(200, Response{
		Code: code,
		Data: nil,
		Msg:  msg,
	})
}
