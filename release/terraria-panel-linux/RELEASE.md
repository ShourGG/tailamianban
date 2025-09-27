# 🎮 Terraria Panel v1.0.0 - 生产就绪版本

## 📦 一键部署 Linux 服务器

```bash
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/deploy/scripts/install.sh | bash
```

## ✨ 新特性

### 🚀 生产级部署
- **一键安装脚本** - 支持 Ubuntu/Debian/CentOS/RHEL/Fedora
- **预构建二进制** - 无需在服务器上编译 Go 代码
- **自动化配置** - PostgreSQL、Redis、Nginx、SSL 证书
- **系统服务** - systemd 服务自动启动和监控
- **安全加固** - 防火墙配置和权限管理

### 🔧 系统监控
- **实时监控** - CPU、内存、磁盘使用率
- **服务器状态** - Terraria 服务器运行状态监控
- **WebSocket 推送** - 实时数据更新
- **跨平台支持** - Windows 和 Linux 监控适配

### 🎯 服务器管理
- **多服务器支持** - 管理多个 Terraria 服务器实例
- **自动重启** - 服务器崩溃自动恢复
- **日志管理** - 实时日志查看和历史记录
- **世界管理** - 世界文件上传、下载、备份

### 🛡️ 安全特性
- **JWT 认证** - 安全的用户认证系统
- **权限控制** - 基于角色的访问控制
- **SSL 支持** - Let's Encrypt 自动证书
- **数据加密** - 敏感数据加密存储

## 📋 系统要求

### 最低配置
- **操作系统**: Ubuntu 18.04+ / Debian 9+ / CentOS 7+ / RHEL 7+ / Fedora 30+
- **内存**: 1GB RAM
- **存储**: 2GB 可用空间
- **网络**: 公网 IP（可选，用于 SSL 证书）

### 推荐配置
- **操作系统**: Ubuntu 22.04 LTS
- **内存**: 2GB+ RAM
- **存储**: 10GB+ SSD
- **CPU**: 2+ 核心

## 🚀 快速开始

### 1. 一键安装
```bash
# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/deploy/scripts/install.sh | bash
```

### 2. 配置域名（可选）
```bash
# 如果有域名，可以配置 SSL
sudo /opt/terraria-panel/deploy/scripts/install.sh --domain your-domain.com --email your@email.com
```

### 3. 访问面板
- **HTTP**: `http://your-server-ip`
- **HTTPS**: `https://your-domain.com`（如果配置了域名）

### 4. 默认登录
- **用户名**: `admin`
- **密码**: 安装时设置或查看 `/opt/terraria-panel/config/admin.txt`

## 📁 文件结构

```
/opt/terraria-panel/
├── terraria-panel          # 主程序二进制文件
├── dist/                    # 前端静态文件
├── deploy/                  # 部署配置文件
│   ├── nginx/              # Nginx 配置
│   ├── systemd/            # 系统服务配置
│   └── scripts/            # 部署脚本
├── terraria-servers/        # Terraria 服务器文件
├── worlds/                  # 世界文件存储
├── backups/                 # 备份文件
└── logs/                    # 日志文件
```

## 🔧 高级配置

### 环境变量
```bash
# 数据库配置
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=terraria_panel
export DB_USER=terraria
export DB_PASSWORD=your_password

# Redis 配置
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=your_redis_password

# JWT 密钥
export JWT_SECRET=your_jwt_secret
```

### 服务管理
```bash
# 启动服务
sudo systemctl start terraria-panel

# 停止服务
sudo systemctl stop terraria-panel

# 重启服务
sudo systemctl restart terraria-panel

# 查看状态
sudo systemctl status terraria-panel

# 查看日志
sudo journalctl -u terraria-panel -f
```

## 🐛 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   sudo netstat -tlnp | grep :8080
   sudo systemctl stop terraria-panel
   ```

2. **数据库连接失败**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -c "\l"
   ```

3. **权限问题**
   ```bash
   sudo chown -R terraria:terraria /opt/terraria-panel
   sudo chmod +x /opt/terraria-panel/terraria-panel
   ```

### 日志查看
```bash
# 应用日志
sudo tail -f /opt/terraria-panel/logs/app.log

# 系统服务日志
sudo journalctl -u terraria-panel -f

# Nginx 日志
sudo tail -f /var/log/nginx/error.log
```

## 🔄 更新升级

### 自动更新
```bash
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/deploy/scripts/update.sh | bash
```

### 手动更新
```bash
cd /opt/terraria-panel
sudo systemctl stop terraria-panel
wget https://github.com/ShourGG/tailamianban/releases/latest/download/terraria-panel-linux
sudo mv terraria-panel-linux terraria-panel
sudo chmod +x terraria-panel
sudo systemctl start terraria-panel
```

## 📞 技术支持

- **GitHub Issues**: [提交问题](https://github.com/ShourGG/tailamianban/issues)
- **文档**: [部署文档](./DEPLOYMENT.md)
- **更新日志**: [CHANGELOG.md](./CHANGELOG.md)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**🎮 享受你的 Terraria 服务器管理体验！**
