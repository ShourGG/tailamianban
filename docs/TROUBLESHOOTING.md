# 泰拉瑞亚面板故障排查指南

## 🔍 空白页问题诊断

如果部署后遇到空白页问题，请按以下步骤进行诊断。

---

## 📋 快速诊断（推荐）

### 1. 使用自动诊断脚本

```bash
# 下载诊断脚本
cd /opt/terraria-panel
chmod +x diagnose.sh
./diagnose.sh
```

脚本会自动检查：
- ✅ 服务进程状态
- ✅ 端口监听情况
- ✅ HTTP响应状态
- ✅ 前端文件完整性
- ✅ 应用日志错误
- ✅ 静态资源访问

---

## 🛠️ 手动诊断步骤

### 步骤1: 检查服务状态

```bash
# 查看进程是否运行
ps aux | grep terraria-panel

# 查看服务日志
tail -f /opt/terraria-panel/terraria-panel.log

# 或者使用journalctl（如果使用systemd）
journalctl -u terraria-panel -f
```

**期望输出**: 应该看到进程正在运行，日志中没有ERROR或PANIC

---

### 步骤2: 检查端口监听

```bash
# 查看配置的端口
cat /opt/terraria-panel/config.json | grep Port

# 检查端口是否在监听（方法1）
netstat -tlnp | grep 8080

# 检查端口是否在监听（方法2）
ss -tlnp | grep 8080

# 测试本地连接
curl -v http://localhost:8080/
```

**期望输出**: 
- 端口应该在监听
- curl应该返回200状态码和HTML内容

---

### 步骤3: 检查前端文件

```bash
# 检查web目录结构
ls -lah /opt/terraria-panel/web/

# 检查关键文件
ls -lh /opt/terraria-panel/web/index.html
ls -lh /opt/terraria-panel/web/assets/

# 查看文件数量
find /opt/terraria-panel/web/assets -name "*.js" | wc -l
find /opt/terraria-panel/web/assets -name "*.css" | wc -l
```

**期望输出**:
- index.html存在
- assets目录存在且包含.js和.css文件

---

### 步骤4: 测试静态资源访问

```bash
# 测试index.html
curl -I http://localhost:8080/index.html

# 测试assets目录
curl -I http://localhost:8080/assets/

# 找一个实际的JS文件测试
JS_FILE=$(ls /opt/terraria-panel/web/assets/*.js | head -1 | xargs basename)
curl -I http://localhost:8080/assets/$JS_FILE

# 查看响应的Content-Type
curl -s -D - http://localhost:8080/assets/$JS_FILE | head -20
```

**期望输出**:
- 所有文件都应该返回200状态码
- JS文件的Content-Type应该是 `application/javascript` 或 `text/javascript`
- CSS文件的Content-Type应该是 `text/css`

---

### 步骤5: 查看实际HTML内容

```bash
# 获取首页HTML
curl -s http://localhost:8080/ | head -50

# 检查HTML中的资源引用
curl -s http://localhost:8080/ | grep -E "(href=|src=)"
```

**期望输出**:
- HTML应该包含完整的Vue应用结构
- 应该有对assets目录下文件的引用

---

### 步骤6: 浏览器开发者工具检查

在浏览器中打开面板，按 **F12** 打开开发者工具：

#### Console标签检查：
```
查找以下类型的错误:
❌ Uncaught SyntaxError
❌ Uncaught ReferenceError  
❌ Failed to load module
❌ CORS policy error
```

#### Network标签检查：
```
1. 刷新页面（Ctrl+F5 强制刷新）
2. 查看所有请求的状态码
3. 特别关注红色的失败请求

常见问题:
❌ 404 Not Found - 文件路径错误
❌ 403 Forbidden - 权限问题
❌ MIME type错误 - Content-Type不正确
```

#### 检查具体文件：
```
右键失败的资源 → Copy → Copy Link Address
然后在终端测试:
curl -I <复制的链接>
```

---

## 🔧 常见问题及解决方案

### 问题1: 404 Not Found 错误

**症状**: Network标签显示多个404错误

**原因**: 
- 前端文件没有正确部署到web目录
- 路由配置错误

**解决方案**:
```bash
# 重新部署
cd /opt/terraria-panel
./panel.sh update

# 或手动检查文件权限
chmod -R 755 /opt/terraria-panel/web
```

---

### 问题2: MIME Type错误

**症状**: Console显示 `Refused to execute script because its MIME type...`

**原因**: Gin路由没有正确设置Content-Type

**解决方案**:
检查服务器代码是否正确处理静态文件，应该在 `internal/api/handlers/panel.go` 中有：
```go
router.NoRoute(gin.WrapH(http.FileServer(http.FS(frontend.DistFS))))
```

---

### 问题3: JavaScript运行时错误

**症状**: Console显示 `Uncaught ReferenceError` 或类似错误

**原因**: 
- 前端代码有bug
- 依赖没有正确打包

**解决方案**:
```bash
# 查看当前版本
cat /opt/terraria-panel/version.txt

# 更新到最新版本
./panel.sh update
```

---

### 问题4: 页面完全空白，无任何错误

**症状**: 
- HTTP 200响应正常
- 无Console错误
- Network无失败请求
- 但页面空白

**诊断**:
```bash
# 检查HTML是否正确
curl http://localhost:8080/ > /tmp/index.html
cat /tmp/index.html

# 检查是否包含 <div id="app">
grep 'id="app"' /tmp/index.html

# 检查JavaScript是否加载
curl http://localhost:8080/ | grep -o 'src="[^"]*\.js"'
```

**解决方案**:
可能是Vue应用初始化失败，检查main.ts中的启动逻辑。

---

## 📊 收集诊断信息

如果以上步骤无法解决问题，请收集以下信息并提交issue：

```bash
# 创建诊断报告
cat > /tmp/diagnostic-report.txt << 'EOF'
=== 系统信息 ===
$(uname -a)
$(cat /etc/os-release)

=== 服务状态 ===
$(ps aux | grep terraria-panel)
$(netstat -tlnp | grep 8080 || ss -tlnp | grep 8080)

=== 版本信息 ===
$(cat /opt/terraria-panel/version.txt)

=== 文件结构 ===
$(ls -lah /opt/terraria-panel/web/)
$(find /opt/terraria-panel/web/assets -type f | wc -l) files in assets

=== HTTP测试 ===
$(curl -I http://localhost:8080/)
$(curl -I http://localhost:8080/index.html)

=== 最近日志 ===
$(tail -50 /opt/terraria-panel/terraria-panel.log)

=== HTML内容预览 ===
$(curl -s http://localhost:8080/ | head -100)
EOF

cat /tmp/diagnostic-report.txt
```

---

## 🚀 快速修复尝试

如果不确定具体问题，可以尝试以下快速修复：

```bash
# 1. 完全重启服务
cd /opt/terraria-panel
./panel.sh stop
sleep 2
./panel.sh start

# 2. 强制更新到最新版本
./panel.sh update

# 3. 检查并修复文件权限
sudo chmod -R 755 /opt/terraria-panel
sudo chown -R $(whoami):$(whoami) /opt/terraria-panel

# 4. 清除浏览器缓存
# 在浏览器中按 Ctrl+Shift+Delete，清除缓存后重新访问
```

---

## 📞 获取帮助

如果问题仍未解决，请：

1. 运行诊断脚本: `./diagnose.sh`
2. 收集浏览器Console和Network的截图
3. 提供诊断报告
4. 在GitHub提交Issue: https://github.com/ShourGG/tailamianban/issues

---

**最后更新**: 2025-01-02
**适用版本**: v1.2.0.9+