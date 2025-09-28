package handlers

import (
	"net/http"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
)

// HealthCheck returns the health status of the application
func HealthCheck(c *gin.Context) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	response := gin.H{
		"status":    "healthy",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"version":   "1.0.0", // TODO: Get from build info
		"uptime":    time.Since(startTime).String(),
		"system": gin.H{
			"go_version":      runtime.Version(),
			"goroutines":      runtime.NumGoroutine(),
			"memory_alloc":    bToMb(m.Alloc),
			"memory_total":    bToMb(m.TotalAlloc),
			"memory_sys":      bToMb(m.Sys),
			"gc_runs":         m.NumGC,
		},
	}

	c.JSON(http.StatusOK, response)
}

var startTime = time.Now()

func bToMb(b uint64) uint64 {
	return b / 1024 / 1024
}