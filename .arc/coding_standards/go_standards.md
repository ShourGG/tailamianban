# Go编码规范

## 基本原则

### 1. 遵循官方规范
- 严格遵循 [Effective Go](https://golang.org/doc/effective_go.html)
- 使用 `gofmt` 格式化代码
- 使用 `golint` 检查代码风格
- 使用 `go vet` 检查潜在问题

### 2. 命名规范

#### 包名 (Package Names)
```go
// ✅ 正确：简短、小写、单数
package server
package config
package auth

// ❌ 错误：复数、下划线、大写
package servers
package server_config
package Auth
```

#### 变量名 (Variable Names)
```go
// ✅ 正确：驼峰命名，简洁明了
var userCount int
var serverConfig *Config
var isRunning bool

// ❌ 错误：下划线、不清晰
var user_count int
var cfg *Config
var flag bool
```

#### 函数名 (Function Names)
```go
// ✅ 正确：动词开头，驼峰命名
func StartServer() error
func GetPlayerList() []Player
func ValidateConfig(cfg *Config) error

// ❌ 错误：名词开头、不清晰
func Server() error
func Players() []Player
func Check(cfg *Config) error
```

#### 常量名 (Constant Names)
```go
// ✅ 正确：全大写，下划线分隔
const (
    DEFAULT_PORT = 8080
    MAX_PLAYERS = 100
    SERVER_TIMEOUT = 30 * time.Second
)

// ❌ 错误：驼峰命名
const (
    defaultPort = 8080
    maxPlayers = 100
)
```

### 3. 结构体设计

#### 结构体定义
```go
// ✅ 正确：字段按重要性和大小排序，添加JSON标签
type ServerConfig struct {
    Name        string        `json:"name" validate:"required"`
    Port        int           `json:"port" validate:"min=1024,max=65535"`
    MaxPlayers  int           `json:"max_players" validate:"min=1,max=100"`
    Password    string        `json:"password,omitempty"`
    IsPublic    bool          `json:"is_public"`
    CreatedAt   time.Time     `json:"created_at"`
    UpdatedAt   time.Time     `json:"updated_at"`
}

// ❌ 错误：字段顺序混乱，缺少标签
type ServerConfig struct {
    IsPublic bool
    Name string
    CreatedAt time.Time
    Port int
    MaxPlayers int
    Password string
    UpdatedAt time.Time
}
```

#### 方法定义
```go
// ✅ 正确：接收者名称简短一致
func (sc *ServerConfig) Validate() error {
    if sc.Name == "" {
        return errors.New("server name is required")
    }
    return nil
}

func (sc *ServerConfig) IsValid() bool {
    return sc.Validate() == nil
}

// ❌ 错误：接收者名称不一致
func (config *ServerConfig) Validate() error { ... }
func (sc *ServerConfig) IsValid() bool { ... }
```

### 4. 错误处理

#### 错误定义
```go
// ✅ 正确：使用errors包定义错误
var (
    ErrServerNotFound    = errors.New("server not found")
    ErrInvalidConfig     = errors.New("invalid configuration")
    ErrServerAlreadyRunning = errors.New("server is already running")
)

// 自定义错误类型
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed for field '%s': %s", e.Field, e.Message)
}
```

#### 错误处理模式
```go
// ✅ 正确：立即检查错误
func StartServer(config *ServerConfig) error {
    if err := config.Validate(); err != nil {
        return fmt.Errorf("config validation failed: %w", err)
    }
    
    server, err := createServer(config)
    if err != nil {
        return fmt.Errorf("failed to create server: %w", err)
    }
    
    if err := server.Start(); err != nil {
        return fmt.Errorf("failed to start server: %w", err)
    }
    
    return nil
}

// ❌ 错误：延迟错误检查
func StartServer(config *ServerConfig) error {
    err1 := config.Validate()
    server, err2 := createServer(config)
    err3 := server.Start()
    
    if err1 != nil || err2 != nil || err3 != nil {
        return errors.New("something went wrong")
    }
    
    return nil
}
```

### 5. 接口设计

#### 接口定义
```go
// ✅ 正确：接口名以-er结尾，方法简洁
type ServerManager interface {
    Start() error
    Stop() error
    Restart() error
    GetStatus() ServerStatus
}

type ConfigValidator interface {
    Validate() error
}

// ❌ 错误：接口名不规范，方法过多
type ServerInterface interface {
    StartServer() error
    StopServer() error
    RestartServer() error
    GetServerStatus() ServerStatus
    SetServerConfig(*Config) error
    GetServerConfig() *Config
    GetServerLogs() []string
    // ... 太多方法
}
```

#### 接口实现
```go
// ✅ 正确：明确的接口实现
type TerrariaServer struct {
    config *ServerConfig
    process *os.Process
    status ServerStatus
}

func (ts *TerrariaServer) Start() error {
    if ts.status == StatusRunning {
        return ErrServerAlreadyRunning
    }
    
    // 启动逻辑
    ts.status = StatusRunning
    return nil
}

func (ts *TerrariaServer) Stop() error {
    if ts.status != StatusRunning {
        return ErrServerNotRunning
    }
    
    // 停止逻辑
    ts.status = StatusStopped
    return nil
}
```

### 6. 并发编程

#### Goroutine使用
```go
// ✅ 正确：使用context控制goroutine生命周期
func (s *Server) StartMonitoring(ctx context.Context) {
    go func() {
        ticker := time.NewTicker(30 * time.Second)
        defer ticker.Stop()
        
        for {
            select {
            case <-ctx.Done():
                return
            case <-ticker.C:
                s.collectMetrics()
            }
        }
    }()
}

// ❌ 错误：无法控制goroutine生命周期
func (s *Server) StartMonitoring() {
    go func() {
        for {
            time.Sleep(30 * time.Second)
            s.collectMetrics()
        }
    }()
}
```

#### Channel使用
```go
// ✅ 正确：明确channel方向和缓冲
func ProcessLogs(logs <-chan string, results chan<- LogEntry) {
    defer close(results)
    
    for log := range logs {
        entry := parseLog(log)
        select {
        case results <- entry:
        case <-time.After(5 * time.Second):
            // 超时处理
            continue
        }
    }
}

// ❌ 错误：未指定channel方向
func ProcessLogs(logs chan string, results chan LogEntry) {
    // 实现
}
```

### 7. 日志记录

#### 日志规范
```go
// ✅ 正确：结构化日志，包含上下文信息
import "github.com/sirupsen/logrus"

func (s *Server) Start() error {
    logger := logrus.WithFields(logrus.Fields{
        "component": "server",
        "action":    "start",
        "server_id": s.ID,
    })
    
    logger.Info("Starting server")
    
    if err := s.initialize(); err != nil {
        logger.WithError(err).Error("Failed to initialize server")
        return err
    }
    
    logger.Info("Server started successfully")
    return nil
}

// ❌ 错误：简单字符串日志，缺少上下文
func (s *Server) Start() error {
    log.Println("Starting server")
    
    if err := s.initialize(); err != nil {
        log.Println("Error:", err)
        return err
    }
    
    log.Println("Server started")
    return nil
}
```

### 8. 测试规范

#### 单元测试
```go
// ✅ 正确：测试函数命名清晰，包含多种场景
func TestServerConfig_Validate(t *testing.T) {
    tests := []struct {
        name    string
        config  *ServerConfig
        wantErr bool
    }{
        {
            name: "valid config",
            config: &ServerConfig{
                Name: "test-server",
                Port: 8080,
                MaxPlayers: 10,
            },
            wantErr: false,
        },
        {
            name: "empty name",
            config: &ServerConfig{
                Name: "",
                Port: 8080,
                MaxPlayers: 10,
            },
            wantErr: true,
        },
        {
            name: "invalid port",
            config: &ServerConfig{
                Name: "test-server",
                Port: 0,
                MaxPlayers: 10,
            },
            wantErr: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.config.Validate()
            if (err != nil) != tt.wantErr {
                t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

#### 基准测试
```go
// ✅ 正确：基准测试
func BenchmarkServerStart(b *testing.B) {
    config := &ServerConfig{
        Name: "benchmark-server",
        Port: 8080,
        MaxPlayers: 10,
    }
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        server := NewServer(config)
        _ = server.Start()
        _ = server.Stop()
    }
}
```

### 9. 文档注释

#### 包文档
```go
// ✅ 正确：包文档说明包的用途
// Package server provides functionality for managing Terraria game servers.
// It includes server lifecycle management, configuration handling, and monitoring capabilities.
//
// Basic usage:
//
//     config := &ServerConfig{
//         Name: "my-server",
//         Port: 7777,
//         MaxPlayers: 10,
//     }
//     
//     server := NewServer(config)
//     if err := server.Start(); err != nil {
//         log.Fatal(err)
//     }
//
package server
```

#### 函数文档
```go
// ✅ 正确：函数文档说明功能、参数、返回值
// StartServer starts a new Terraria server instance with the given configuration.
// It validates the configuration, creates the server process, and begins monitoring.
//
// Parameters:
//   - config: Server configuration including name, port, and player limits
//
// Returns:
//   - error: nil if successful, otherwise an error describing what went wrong
//
// Example:
//     config := &ServerConfig{Name: "test", Port: 7777}
//     if err := StartServer(config); err != nil {
//         log.Printf("Failed to start server: %v", err)
//     }
func StartServer(config *ServerConfig) error {
    // 实现
}
```

### 10. 性能优化

#### 内存优化
```go
// ✅ 正确：使用对象池减少内存分配
var bufferPool = sync.Pool{
    New: func() interface{} {
        return make([]byte, 1024)
    },
}

func ProcessData(data []byte) []byte {
    buf := bufferPool.Get().([]byte)
    defer bufferPool.Put(buf)
    
    // 处理数据
    return result
}

// ❌ 错误：频繁内存分配
func ProcessData(data []byte) []byte {
    buf := make([]byte, 1024) // 每次都分配新内存
    // 处理数据
    return result
}
```

#### CPU优化
```go
// ✅ 正确：避免不必要的字符串拼接
func BuildMessage(parts []string) string {
    var builder strings.Builder
    builder.Grow(len(parts) * 10) // 预分配容量
    
    for _, part := range parts {
        builder.WriteString(part)
    }
    
    return builder.String()
}

// ❌ 错误：频繁字符串拼接
func BuildMessage(parts []string) string {
    result := ""
    for _, part := range parts {
        result += part // 每次都创建新字符串
    }
    return result
}
```