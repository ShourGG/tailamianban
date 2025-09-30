package handlers

import (
	"net/http"
	"runtime"
	"terraria-panel/internal/service"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
)

// SystemMetrics represents system resource metrics
type SystemMetrics struct {
	CPU       CPUMetrics     `json:"cpu"`
	Memory    MemoryMetrics  `json:"memory"`
	Disk      DiskMetrics    `json:"disk"`
	Network   NetworkMetrics `json:"network"`
	Timestamp time.Time      `json:"timestamp"`
}

// CPUMetrics represents CPU usage information
type CPUMetrics struct {
	UsagePercent float64   `json:"usage_percent"`
	Cores        int       `json:"cores"`
	LoadAverage  []float64 `json:"load_average"`
}

// MemoryMetrics represents memory usage information
type MemoryMetrics struct {
	Total       uint64      `json:"total"`
	Used        uint64      `json:"used"`
	Free        uint64      `json:"free"`
	UsedPercent float64     `json:"used_percent"`
	Swap        SwapMetrics `json:"swap"`
}

// SwapMetrics represents swap usage information
type SwapMetrics struct {
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"used_percent"`
}

// DiskMetrics represents disk usage information
type DiskMetrics struct {
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"used_percent"`
	Path        string  `json:"path"`
}

// NetworkMetrics represents network usage information
type NetworkMetrics struct {
	BytesSent   uint64 `json:"bytes_sent"`
	BytesRecv   uint64 `json:"bytes_recv"`
	PacketsSent uint64 `json:"packets_sent"`
	PacketsRecv uint64 `json:"packets_recv"`
	ErrorsIn    uint64 `json:"errors_in"`
	ErrorsOut   uint64 `json:"errors_out"`
}

// ProcessInfo represents process information
type ProcessInfo struct {
	PID        int32   `json:"pid"`
	Name       string  `json:"name"`
	CPU        float64 `json:"cpu_percent"`
	Memory     float32 `json:"memory_percent"`
	Status     string  `json:"status"`
	CreateTime int64   `json:"create_time"`
	Username   string  `json:"username"`
}

// GetSystemMetrics returns current system metrics
func GetSystemMetrics(c *gin.Context) {
	// Get CPU metrics
	cpuPercent, err := cpu.Percent(time.Second, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get CPU metrics",
			"code":  "CPU_METRICS_ERROR",
		})
		return
	}

	cpuCount, _ := cpu.Counts(true)

	cpuMetrics := CPUMetrics{
		UsagePercent: cpuPercent[0],
		Cores:        cpuCount,
	}

	// Load average is typically not available on Windows
	// For Linux systems, you can get it from /proc/loadavg

	// Get memory metrics
	vmStat, err := mem.VirtualMemory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get memory metrics",
			"code":  "MEMORY_METRICS_ERROR",
		})
		return
	}

	swapStat, _ := mem.SwapMemory()

	memoryMetrics := MemoryMetrics{
		Total:       vmStat.Total,
		Used:        vmStat.Used,
		Free:        vmStat.Free,
		UsedPercent: vmStat.UsedPercent,
	}

	if swapStat != nil {
		memoryMetrics.Swap = SwapMetrics{
			Total:       swapStat.Total,
			Used:        swapStat.Used,
			Free:        swapStat.Free,
			UsedPercent: swapStat.UsedPercent,
		}
	}

	// Get disk metrics
	diskStat, err := disk.Usage("/")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get disk metrics",
			"code":  "DISK_METRICS_ERROR",
		})
		return
	}

	diskMetrics := DiskMetrics{
		Total:       diskStat.Total,
		Used:        diskStat.Used,
		Free:        diskStat.Free,
		UsedPercent: diskStat.UsedPercent,
		Path:        diskStat.Path,
	}

	// Get network metrics
	netStat, err := net.IOCounters(false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get network metrics",
			"code":  "NETWORK_METRICS_ERROR",
		})
		return
	}

	var networkMetrics NetworkMetrics
	if len(netStat) > 0 {
		networkMetrics = NetworkMetrics{
			BytesSent:   netStat[0].BytesSent,
			BytesRecv:   netStat[0].BytesRecv,
			PacketsSent: netStat[0].PacketsSent,
			PacketsRecv: netStat[0].PacketsRecv,
			ErrorsIn:    netStat[0].Errin,
			ErrorsOut:   netStat[0].Errout,
		}
	}

	// Combine all metrics
	metrics := SystemMetrics{
		CPU:       cpuMetrics,
		Memory:    memoryMetrics,
		Disk:      diskMetrics,
		Network:   networkMetrics,
		Timestamp: time.Now(),
	}

	// Store metrics in history
	service.StoreMetrics(metrics)

	c.JSON(http.StatusOK, metrics)
}

// GetMetricsHistory returns historical system metrics
func GetMetricsHistory(c *gin.Context) {
	// Get query parameters
	duration := c.DefaultQuery("duration", "1h")
	resolution := c.DefaultQuery("resolution", "1m")

	// Parse duration
	dur, err := time.ParseDuration(duration)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid duration format",
			"code":  "INVALID_DURATION",
		})
		return
	}

	// Get historical metrics
	history, err := service.GetMetricsHistory(dur, resolution)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get metrics history",
			"code":  "METRICS_HISTORY_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"history":    history,
		"duration":   duration,
		"resolution": resolution,
		"count":      len(history),
	})
}

// GetSystemInfo returns system information
func GetSystemInfo(c *gin.Context) {
	// Get host information
	hostStat, err := host.Info()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get system information",
			"code":  "SYSTEM_INFO_ERROR",
		})
		return
	}

	// Get runtime information
	runtimeInfo := map[string]interface{}{
		"go_version":    runtime.Version(),
		"go_arch":       runtime.GOARCH,
		"go_os":         runtime.GOOS,
		"num_cpu":       runtime.NumCPU(),
		"num_goroutine": runtime.NumGoroutine(),
	}

	// Get Terraria server info
	terrariaInfo, _ := service.GetTerrariaServerInfo()

	systemInfo := map[string]interface{}{
		"hostname":         hostStat.Hostname,
		"platform":         hostStat.Platform,
		"platform_family":  hostStat.PlatformFamily,
		"platform_version": hostStat.PlatformVersion,
		"kernel_version":   hostStat.KernelVersion,
		"kernel_arch":      hostStat.KernelArch,
		"uptime":           hostStat.Uptime,
		"boot_time":        hostStat.BootTime,
		"procs":            hostStat.Procs,
		"os":               hostStat.OS,
		"host_id":          hostStat.HostID,
		"runtime":          runtimeInfo,
		"terraria":         terrariaInfo,
	}

	c.JSON(http.StatusOK, systemInfo)
}

// GetProcessList returns list of running processes
func GetProcessList(c *gin.Context) {
	// Get filter parameters
	_ = c.DefaultQuery("sort", "cpu") // sortBy for future use
	limit := 50

	// Get all processes
	processes, err := process.Processes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get process list",
			"code":  "PROCESS_LIST_ERROR",
		})
		return
	}

	// Build process info list
	var processList []ProcessInfo
	for _, p := range processes {
		// Skip processes we can't access
		name, err := p.Name()
		if err != nil {
			continue
		}

		cpu, _ := p.CPUPercent()
		mem, _ := p.MemoryPercent()
		status, _ := p.Status()
		createTime, _ := p.CreateTime()
		username, _ := p.Username()

		processInfo := ProcessInfo{
			PID:        p.Pid,
			Name:       name,
			CPU:        cpu,
			Memory:     mem,
			Status:     status[0],
			CreateTime: createTime,
			Username:   username,
		}

		processList = append(processList, processInfo)

		// Limit the number of processes
		if len(processList) >= limit {
			break
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"processes": processList,
		"count":     len(processList),
		"total":     len(processes),
	})
}
