# 版本号识别修复总结

## 问题描述
更新面板后，`panel.sh` 脚本无法正确识别本地安装的版本号，总是显示为 `Terraria Panel 1.0.0 (Build: dev)`，导致每次都提示有新版本可更新。

## 根本原因
1. **变量命名不匹配**: `cmd/main.go` 中定义的版本变量名为 `VERSION`（全大写），但 GitHub Actions 使用 `-X main.Version=...` 注入版本号，Go 的 `-ldflags` 只能覆盖**导出的**变量（首字母大写）
2. **缺少 API 端点**: 没有提供 HTTP API 来查询版本信息
3. **脚本依赖命令行**: `panel.sh` 脚本依赖 `--version` 命令行参数，但在服务运行时无法获取

## 解决方案

### 1. 修改 `cmd/main.go` (v1.1.6)
**变量重命名**:
```go
// 修改前
var (
    VERSION = "1.0.0"
    BUILD   = "dev"
)

// 修改后
var (
    // Version will be set by ldflags during build
    Version = "1.0.0"
    Build   = "dev"
)
```

**传递版本信息给 handlers**:
```go
// 在 main() 函数中添加
handlers.AppVersion = Version
handlers.BuildInfo = Build
```

### 2. 新增版本 API 端点 (`internal/api/handlers/system.go`)
```go
// 在文件开头添加包级变量
var (
    AppVersion = "1.0.0"
    BuildInfo  = "dev"
)

// 新增处理函数
func GetVersion(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "version":    AppVersion,
        "build":      BuildInfo,
        "go_version": runtime.Version(),
        "os":         runtime.GOOS,
        "arch":       runtime.GOARCH,
    })
}
```

### 3. 注册路由 (`internal/api/routes.go`)
```go
// 添加公开的版本查询端点
api.GET("/version", handlers.GetVersion)
```

### 4. 更新 GitHub Actions (`.github/workflows/release.yml`)
```yaml
# 修改 ldflags，同时注入到两个地方
go build -ldflags "-s -w \
  -X main.Version=${VERSION} \
  -X main.Build=release \
  -X terraria-panel/internal/api/handlers.AppVersion=${VERSION} \
  -X terraria-panel/internal/api/handlers.BuildInfo=release" \
  -o terraria-panel cmd/main.go
```

### 5. 优化 `panel.sh` 脚本
新增 `get_local_version()` 函数，优先使用 API 查询：
```bash
get_local_version() {
    if ! check_running; then
        echo "未运行"
        return
    fi
    
    # 优先从 API 获取版本
    local version=$(curl -s --connect-timeout 2 http://localhost:8080/api/version 2>/dev/null | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    
    # 如果 API 失败，回退到命令行
    if [ -z "$version" ] && [ -f "$INSTALL_DIR/terraria-panel" ]; then
        version=$($INSTALL_DIR/terraria-panel --version 2>/dev/null | head -1 || echo "未知")
    fi
    
    echo "${version:-未知}"
}
```

## 工作流程

### 构建时 (CI/CD)
1. GitHub Actions 触发构建
2. 使用 `-ldflags` 将 Git tag 注入到 `main.Version` 和 `handlers.AppVersion`
3. 编译后的二进制文件包含正确的版本号

### 运行时
1. 应用启动时，`main.go` 将 `Version` 赋值给 `handlers.AppVersion`
2. 用户访问 `/api/version` 端点获取版本信息
3. `panel.sh` 脚本通过 API 查询当前运行版本

### 版本比较
1. `panel.sh` 调用 `get_local_version()` 获取本地版本
2. 调用 `get_latest_version()` 获取 GitHub 最新版本
3. 比较两者，只有不同时才提示更新

## API 使用示例

```bash
# 查询版本信息
curl http://localhost:8080/api/version

# 响应示例
{
  "version": "v1.1.6",
  "build": "release",
  "go_version": "go1.23.0",
  "os": "linux",
  "arch": "amd64"
}
```

## 测试验证

### 1. 本地测试命令行
```bash
./terraria-panel --version
# 输出: Terraria Panel v1.1.6 (Build: release)
```

### 2. 测试 API 端点
```bash
# 启动服务后
curl http://localhost:8080/api/version
```

### 3. 测试脚本识别
```bash
sudo bash panel.sh
# 选择 "6. 查看状态"
# 应该正确显示: 当前版本: v1.1.6
```

## 版本发布流程

1. **创建新版本**:
   ```bash
   git tag v1.1.6
   git push origin v1.1.6
   ```

2. **自动构建**: GitHub Actions 自动触发构建，注入版本号 `v1.1.6`

3. **用户更新**: 
   ```bash
   sudo bash panel.sh
   # 选择 "2. 更新面板"
   # 系统会正确识别本地版本并与 GitHub 最新版本比较
   ```

## 优势

1. ✅ **准确识别**: 通过 API 实时获取运行中的版本
2. ✅ **双重保障**: API 失败时回退到命令行查询
3. ✅ **自动化**: 构建时自动注入版本号，无需手动维护
4. ✅ **一致性**: 命令行、API、日志中的版本号完全一致
5. ✅ **可追溯**: 版本号直接对应 Git tag，便于追踪

## 注意事项

1. **端口访问**: API 默认监听 8080 端口，确保防火墙允许本地访问
2. **服务状态**: 只有服务运行时才能通过 API 获取版本
3. **超时设置**: API 请求设置了 2 秒超时，避免长时间等待
4. **版本格式**: 统一使用 `v1.x.x` 格式（带 v 前缀）

## 下一步

发布 v1.1.6 版本后，用户更新后将能够正确识别版本号，不会再出现误报更新的情况。