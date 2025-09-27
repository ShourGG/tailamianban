# 🚀 Terraria Panel 一键部署指南

## 📦 快速部署 (Linux推荐)

### 方法1: 超级简单一键部署
```bash
# 下载并执行一键安装脚本
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/scripts/install.sh | bash
```

### 方法2: 手动下载部署
```bash
# 1. 下载最新发布包
wget https://github.com/ShourGG/tailamianban/releases/latest/download/terraria-panel-v1.0.0-linux.tar.gz

# 2. 解压
tar -xzf terraria-panel-v1.0.0-linux.tar.gz

# 3. 进入目录
cd terraria-panel-v1.0.0

# 4. 启动服务
chmod +x scripts/deploy-ultra.sh
./scripts/deploy-ultra.sh start
```

## 🖥️ Windows 部署

```cmd
# 1. 下载 Windows 发布包
# https://github.com/ShourGG/tailamianban/releases/latest/download/terraria-panel-v1.0.0-windows.zip

# 2. 解压到目标目录

# 3. 直接运行
cd backend
terraria-panel-windows.exe
```

## 🎯 访问面板

部署完成后，打开浏览器访问:
- **管理面板**: http://your-server-ip:8080
- **UltraThink监控**: http://your-server-ip:8080/monitor
- **API文档**: http://your-server-ip:8080/api

## 🔧 服务管理 (Linux systemd)

```bash
# 查看服务状态
sudo systemctl status terraria-panel

# 启动服务
sudo systemctl start terraria-panel

# 停止服务
sudo systemctl stop terraria-panel

# 重启服务
sudo systemctl restart terraria-panel

# 查看日志
sudo journalctl -u terraria-panel -f

# 开机自启
sudo systemctl enable terraria-panel
```

## 📋 系统要求

### 最低配置
- **Linux**: CentOS 7+, Ubuntu 18.04+, Debian 9+
- **Windows**: Windows Server 2016+, Windows 10+
- **内存**: 512MB
- **磁盘**: 100MB
- **网络**: 端口 8080 (面板) + 7777-7800 (游戏服务器)

### 推荐配置
- **内存**: 1GB+
- **磁盘**: 1GB+ (用于世界文件和备份)
- **CPU**: 2核+ (多服务器运行时)

## 🛡️ 安全配置

### 1. 防火墙设置

#### Ubuntu/Debian (ufw)
```bash
sudo ufw allow 8080/tcp comment "Terraria Panel"
sudo ufw allow 7777:7800/tcp comment "Terraria Servers"
sudo ufw enable
```

#### CentOS/RHEL (firewalld)
```bash
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=7777-7800/tcp
sudo firewall-cmd --reload
```

### 2. 修改默认配置
```bash
# 编辑配置文件
nano /opt/terraria-panel/backend/config.yaml

# 重要: 修改 JWT 密钥
jwt:
  secret: "your-super-secure-secret-key-here"
```

### 3. 设置 HTTPS (可选)
使用 Nginx 反向代理:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support for UltraThink monitoring
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🔄 升级指南

### 自动升级 (推荐)
```bash
# 重新运行一键安装脚本即可自动升级
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/scripts/install.sh | bash
```

### 手动升级
```bash
# 1. 停止服务
sudo systemctl stop terraria-panel

# 2. 备份数据
cp -r /opt/terraria-panel/backend/data /backup/terraria-panel-data-$(date +%Y%m%d)

# 3. 下载新版本
wget https://github.com/ShourGG/tailamianban/releases/latest/download/terraria-panel-latest-linux.tar.gz

# 4. 解压并替换
tar -xzf terraria-panel-latest-linux.tar.gz
sudo cp -r terraria-panel-*/backend/* /opt/terraria-panel/backend/

# 5. 启动服务
sudo systemctl start terraria-panel
```

## 📊 监控和维护

### 1. UltraThink 实时监控
访问 `http://your-server-ip:8080/monitor` 查看:
- 系统性能指标 (CPU, 内存, 磁盘)
- 服务器状态监控
- 玩家在线统计
- 系统告警

### 2. 日志管理
```bash
# 查看应用日志
sudo journalctl -u terraria-panel -n 100

# 查看错误日志
sudo journalctl -u terraria-panel -p err

# 实时日志
sudo journalctl -u terraria-panel -f
```

### 3. 数据备份
```bash
# 创建备份脚本
cat > /opt/terraria-panel/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/terraria-panel"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" \
    /opt/terraria-panel/backend/data \
    /opt/terraria-panel/backend/worlds \
    /opt/terraria-panel/backend/config.yaml

# 保留最近30天的备份
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
EOF

chmod +x /opt/terraria-panel/backup.sh

# 设置每日自动备份
echo "0 2 * * * /opt/terraria-panel/backup.sh" | sudo crontab -
```

## 🐛 故障排除

### 1. 端口被占用
```bash
# 检查端口占用
netstat -tlnp | grep :8080

# 修改端口 (编辑配置文件)
nano /opt/terraria-panel/backend/config.yaml
```

### 2. 服务启动失败
```bash
# 查看详细错误
sudo journalctl -u terraria-panel -n 50

# 检查配置文件语法
/opt/terraria-panel/backend/terraria-panel-linux --check-config
```

### 3. 权限问题
```bash
# 修复文件权限
sudo chown -R terraria:terraria /opt/terraria-panel
sudo chmod +x /opt/terraria-panel/backend/terraria-panel-linux
```

### 4. 数据库问题
```bash
# 重置数据库 (谨慎操作!)
sudo systemctl stop terraria-panel
sudo rm /opt/terraria-panel/backend/data/panel.db
sudo systemctl start terraria-panel
```

## 🚀 高级配置

### 1. 多服务器负载均衡
使用 Nginx 配置多个面板实例:
```nginx
upstream terraria_panel {
    server 127.0.0.1:8080 weight=1;
    server 127.0.0.1:8081 weight=1;
}

server {
    listen 80;
    location / {
        proxy_pass http://terraria_panel;
    }
}
```

### 2. Docker 部署 (实验性)
```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y wget tar

COPY terraria-panel-linux /app/
COPY config.yaml /app/

WORKDIR /app
EXPOSE 8080

CMD ["./terraria-panel-linux"]
```

### 3. 性能调优
```yaml
# config.yaml 性能调优
server:
  port: 8080
  read_timeout: 60
  write_timeout: 60
  idle_timeout: 300

terraria:
  max_servers: 20  # 根据服务器性能调整
  port_range: "7777-7820"  # 扩大端口范围
```

## 📞 技术支持

### 获取帮助
1. **GitHub Issues**: https://github.com/ShourGG/tailamianban/issues
2. **文档**: 查看项目 Wiki
3. **社区**: 加入讨论组

### 报告问题时请提供
- 操作系统版本
- 面板版本号
- 错误日志
- 复现步骤

## 🎮 开始管理你的泰拉瑞亚服务器！

安装完成后，你就可以:
1. 📊 通过 UltraThink 监控系统性能
2. 🎮 创建和管理多个泰拉瑞亚服务器
3. 🌍 上传/下载世界文件
4. 👥 监控玩家在线状态
5. 📦 自动备份重要数据

享受你的泰拉瑞亚服务器管理体验！🎉

---

**© 2025 Terraria Panel Team | Built with ❤️ by 老王**