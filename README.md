# 🚀 泰拉瑞亚管理平台 - 自动化部署指南

## 📦 一键部署（Linux服务器）

### 快速安装

在Linux服务器上执行以下命令即可自动部署：

```bash
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/deploy.sh | sudo bash
```

**安装过程会自动：**
- ✅ 检查系统依赖
- ✅ 从GitHub下载最新版本
- ✅ 安装到 `/opt/terraria-admin`
- ✅ 创建systemd服务（开机自启）
- ✅ 安装管理命令工具
- ✅ 启动服务

### 安装后访问

```
http://你的服务器IP:8080
```

**默认账号：**
- 用户名: `CHENY` 或 `admin`
- 密码: `123456` 或 `admin`

⚠️ 首次登录后请立即修改密码！

---

## 🔧 管理命令

安装后，可以使用 `terraria-admin` 命令管理服务：

```bash
# 启动服务
terraria-admin start

# 停止服务
terraria-admin stop

# 重启服务
terraria-admin restart

# 查看状态
terraria-admin status

# 查看日志
terraria-admin logs

# 查看/修改端口
terraria-admin port          # 查看当前端口
terraria-admin port 3000     # 修改端口为3000

# 更新到最新版本
terraria-admin update

# 卸载
terraria-admin uninstall
```

---

## 🎮 在面板中安装游戏服务器

部署完成后，登录面板进行游戏服务器安装：

1. **登录面板**：访问 `http://服务器IP:8080`
2. **进入安装页面**：系统设置 → 安装游戏服务器
3. **选择版本**：
   - ✅ **TShock** - 推荐，支持插件和权限管理
   - ✅ **官方原版** - 纯净游戏体验
   - ✅ **TModLoader** - 支持Mod扩展
4. **点击安装**：自动下载并安装游戏服务器
5. **创建房间**：安装完成后，前往"房间管理"创建游戏房间

### 支持的游戏版本

| 类型 | 版本 | 特性 | 推荐 |
|------|------|------|------|
| TShock | 5.2.0 | 插件系统、权限管理、REST API | ✅ 推荐 |
| TShock | 4.5.20 | 旧版稳定版 | - |
| 官方原版 | 1.4.4.9 | 无插件、最稳定 | - |
| TModLoader | 2023.8 | 支持Mod | - |

---

## 🛠️ GitHub Actions CI/CD

本项目已配置完整的CI/CD流程，每次推送代码后自动：

### 自动触发条件

- **推送到main分支** → 自动测试、构建、发布`latest`版本
- **推送tag（如v1.0.0）** → 自动测试、构建、发布正式版本
- **Pull Request** → 自动运行测试

### 构建内容

1. **前端测试** - 运行单元测试
2. **后端测试** - 运行Go测试
3. **前端构建** - `npm run build` 生成静态文件
4. **后端编译** - 编译Linux amd64和arm64版本
5. **打包发布** - 自动创建GitHub Release

### 发布正式版本

```bash
# 本地打标签并推送
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions会自动构建并发布
```

---

## 📋 手动部署步骤

如果不想使用一键脚本，可以手动部署：

### 1. 下载最新版本

访问 [Releases](https://github.com/ShourGG/tailamianban/releases/latest) 下载：
- `terraria-admin-linux-amd64.tar.gz` （x64服务器）
- `terraria-admin-linux-arm64.tar.gz` （ARM服务器）

### 2. 解压并安装

```bash
# 解压
tar -xzf terraria-admin-linux-amd64.tar.gz
cd terraria-admin-linux-amd64

# 移动到安装目录
sudo mkdir -p /opt/terraria-admin
sudo cp -r * /opt/terraria-admin/
sudo chmod +x /opt/terraria-admin/terraria-server
```

### 3. 创建systemd服务

```bash
sudo tee /etc/systemd/system/terraria-admin.service > /dev/null <<EOF
[Unit]
Description=Terraria Server Admin Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/terraria-admin
ExecStart=/opt/terraria-admin/terraria-server -p 8080 -static ./web -d ./config
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### 4. 启动服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable terraria-admin
sudo systemctl start terraria-admin
sudo systemctl status terraria-admin
```

---

## 🔐 安全建议

### 防火墙配置

```bash
# 开放管理面板端口
sudo ufw allow 8080/tcp

# 开放泰拉瑞亚游戏端口（根据需要）
sudo ufw allow 7777/tcp

# 启用防火墙
sudo ufw enable
```

### Nginx反向代理（推荐）

配置Nginx实现HTTPS和域名访问：

```nginx
server {
    listen 80;
    server_name terraria.yourdomain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name terraria.yourdomain.com;
    
    # SSL证书（使用Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/terraria.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/terraria.yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**申请Let's Encrypt证书：**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d terraria.yourdomain.com
```

---

## 🔄 更新流程

### 自动更新

```bash
terraria-admin update
```

### 手动更新

```bash
# 1. 停止服务
sudo systemctl stop terraria-admin

# 2. 备份配置
sudo cp -r /opt/terraria-admin/config /tmp/config-backup

# 3. 下载新版本
curl -L -o /tmp/terraria-admin.tar.gz \
  https://github.com/ShourGG/tailamianban/releases/latest/download/terraria-admin-linux-amd64.tar.gz

# 4. 解压覆盖
cd /opt/terraria-admin
sudo tar -xzf /tmp/terraria-admin.tar.gz --strip-components=1

# 5. 恢复配置
sudo cp -r /tmp/config-backup/* /opt/terraria-admin/config/

# 6. 重启服务
sudo systemctl start terraria-admin
```

---

## 📊 监控和日志

### 查看日志

```bash
# 实时日志
sudo journalctl -u terraria-admin -f

# 最近100行
sudo journalctl -u terraria-admin -n 100

# 查看应用日志
sudo tail -f /opt/terraria-admin/logs/server.log
```

### 系统资源监控

```bash
# 查看进程状态
ps aux | grep terraria-server

# 查看端口监听
sudo netstat -tulpn | grep 8080

# 查看磁盘使用
df -h
du -sh /opt/terraria-admin/*
```

---

## ❓ 常见问题

### 1. 端口被占用

```bash
# 查看占用8080端口的进程
sudo lsof -i :8080

# 修改端口
terraria-admin port 3000
```

### 2. 服务启动失败

```bash
# 查看详细错误
sudo journalctl -u terraria-admin -n 50

# 检查文件权限
sudo chmod +x /opt/terraria-admin/terraria-server

# 检查端口权限（如果使用<1024端口）
sudo setcap 'cap_net_bind_service=+ep' /opt/terraria-admin/terraria-server
```

### 3. 无法下载游戏服务器

检查防火墙和网络：

```bash
# 测试GitHub连接
curl -I https://github.com

# 测试下载链接
curl -I https://github.com/Pryaxis/TShock/releases/

# 配置代理（如需要）
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port
```

### 4. 前端页面404

```bash
# 检查静态文件
ls -la /opt/terraria-admin/web/

# 检查配置
cat /opt/terraria-admin/config.json

# 重新构建前端（开发环境）
cd terraria-admin
npm install
npm run build
```

---

## 🗺️ 目录结构

```
/opt/terraria-admin/
├── terraria-server        # 后端可执行文件
├── web/                   # 前端静态文件
│   ├── assets/
│   ├── index.html
│   └── ...
├── config/                # 数据库和配置
│   └── terraria.db
├── config.json            # 主配置文件
├── logs/                  # 日志目录
│   └── server.log
└── terraria_servers/      # 游戏服务器文件
    ├── tshock-5.2.0/
    ├── vanilla-1.4.4.9/
    └── ...
```

---

## 🤝 参与贡献

欢迎提交Issue和Pull Request！

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/ShourGG/tailamianban.git
cd tailamianban

# 前端开发
cd terraria-admin
npm install
npm run dev        # http://localhost:1989

# 后端开发
cd terraria-api
go run main.go -p 8080 -dev
```

---

## 📄 许可证

MIT License

---

## 📞 支持

- **GitHub Issues**: https://github.com/ShourGG/tailamianban/issues
- **文档**: 查看 [README.md](README.md) 和本部署指南

---

**🌟 如果这个项目对你有帮助，请给个Star！**
