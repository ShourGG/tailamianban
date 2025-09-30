# 🎮 泰拉瑞亚服务器管理面板

一个现代化的泰拉瑞亚游戏服务器管理面板，基于 Go + Vue3 + Naive UI 构建，提供简单易用的一键部署体验。

## ✨ 特性

### 🚀 部署特性
- **一键部署** - 下载即用，无需安装任何依赖
- **单一二进制** - 所有功能打包在一个可执行文件中
- **零配置启动** - 默认配置开箱即用
- **Linux专用** - 专为Linux服务器环境优化

### 🎯 核心功能
- **服务器管理** - 启动/停止/重启泰拉瑞亚服务器
- **世界管理** - 上传/下载/备份游戏世界文件
- **玩家管理** - 在线玩家监控、踢出、封禁管理
- **系统监控** - 实时CPU、内存、网络使用情况
- **面板管理** - 用户权限、审计日志、安全设置

### 🛡️ 安全特性
- **单端口策略** - 仅开放8080端口，减少攻击面
- **JWT认证** - 安全的用户认证机制
- **权限控制** - 基于角色的访问控制
- **审计日志** - 完整的操作记录追踪
- **安全头** - 内置XSS、CSRF等安全防护

### 💻 技术特性
- **现代化界面** - Vue3 + TypeScript + Naive UI
- **响应式设计** - 支持桌面和移动设备
- **实时更新** - WebSocket实时数据推送
- **高性能** - Go语言后端，SQLite数据库

## 📋 系统要求

### 🖥️ 服务器要求
- **操作系统**: Linux (Ubuntu 18.04+, CentOS 7+, Debian 9+)
- **架构**: x86_64 (amd64) 或 ARM64
- **内存**: 最少 512MB RAM (推荐 1GB+)
- **存储**: 最少 100MB 可用空间
- **网络**: 开放 8080 端口

### ⚠️ 重要限制
- **仅支持Linux系统** - 不支持Windows或macOS
- **需要root权限** - 安装时需要sudo权限
- **单服务器实例** - 一个面板管理一个泰拉瑞亚服务器
- **SQLite数据库** - 不支持外部数据库连接

## 🚀 快速开始

### 方式一：交互式管理脚本 (最简单，强烈推荐！)

```bash
# 下载管理脚本
wget https://raw.githubusercontent.com/ShourGG/tailamianban/main/panel.sh

# 赋予执行权限
chmod +x panel.sh

# 运行脚本
sudo ./panel.sh
```

**交互式菜单操作：**
1. 首次使用选择 `1. 下载并安装面板`
2. 已安装用户选择 `2. 更新面板` 即可一键更新
3. 其他选项：启动/停止/重启/查看状态/查看日志/卸载

### 方式二：一键安装脚本

```bash
# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/scripts/install.sh | sudo bash

# 安装完成后自动启动，访问面板
http://你的服务器IP:8080
```

### 方式三：手动安装

```bash
# 1. 下载最新版本
wget https://github.com/ShourGG/tailamianban/releases/latest/download/terraria-panel-linux-amd64.tar.gz

# 2. 解压文件
tar -xzf terraria-panel-linux-amd64.tar.gz
cd terraria-panel

# 3. 启动面板
chmod +x scripts/run.sh
./scripts/run.sh start

# 4. 访问面板
http://localhost:8080
```

### 默认登录信息
- **用户名**: `admin`
- **密码**: `admin123`

> ⚠️ **安全提醒**: 首次登录后请立即修改默认密码！

## 🔧 管理命令

### 使用run.sh脚本管理

```bash
# 启动面板
./scripts/run.sh start

# 停止面板
./scripts/run.sh stop

# 重启面板
./scripts/run.sh restart

# 查看状态
./scripts/run.sh status

# 查看实时日志
./scripts/run.sh logs

# 清理日志
./scripts/run.sh clear

# 显示系统信息
./scripts/run.sh info
```

### 使用systemd管理 (安装脚本安装后)

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

# 开机自启
sudo systemctl enable terraria-panel
```

## 📁 目录结构

```
terraria-panel/
├── terraria-panel          # 主程序二进制文件
├── dist/                    # 前端静态资源 (已构建)
├── scripts/                 # 管理脚本
│   ├── run.sh              # 主管理脚本
│   └── install.sh          # 一键安装脚本
├── data/                    # 数据目录 (运行时创建)
│   ├── panel.db            # SQLite数据库
│   └── worlds/             # 世界文件存储
├── logs/                    # 日志目录 (运行时创建)
├── configs/                 # 配置文件目录
└── README.md               # 说明文档
```

## 🌐 网络配置

### 端口说明
- **8080** - 面板Web界面端口 (必须开放)
- **7777** - 泰拉瑞亚服务器端口 (内网，不对外开放)

### 防火墙配置

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 8080/tcp

# firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# iptables
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
```

## 🔒 安全配置

### 1. 修改默认密码
首次登录后立即在"设置"页面修改管理员密码。

### 2. 配置SSL证书 (推荐)
使用Nginx反向代理配置HTTPS：

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
    }
}
```

### 3. 限制访问IP (可选)
在防火墙中限制只允许特定IP访问8080端口。

## 🐛 故障排除

### 常见问题

#### 1. 面板无法启动
```bash
# 查看详细日志
./scripts/run.sh logs

# 检查端口占用
sudo netstat -tlnp | grep 8080

# 检查权限
ls -la terraria-panel
```

#### 2. 无法访问面板
```bash
# 检查防火墙状态
sudo ufw status
sudo firewall-cmd --list-ports

# 检查服务状态
./scripts/run.sh status
```

#### 3. 泰拉瑞亚服务器无法启动
- 确保已正确配置泰拉瑞亚服务器路径
- 检查世界文件是否存在且有效
- 查看服务器日志获取详细错误信息

### 日志位置
- **面板日志**: `./logs/terraria-panel.log`
- **系统日志**: `journalctl -u terraria-panel`
- **泰拉瑞亚服务器日志**: 在面板中查看

## 🔄 更新升级

### 自动更新 (推荐)
```bash
# 下载新版本安装脚本
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/scripts/install.sh | sudo bash
```

### 手动更新
```bash
# 1. 停止服务
./scripts/run.sh stop

# 2. 备份数据
cp -r data/ data_backup/

# 3. 下载新版本
wget https://github.com/ShourGG/tailamianban/releases/latest/download/terraria-panel-linux-amd64.tar.gz

# 4. 替换程序文件
tar -xzf terraria-panel-linux-amd64.tar.gz
cp terraria-panel-new/terraria-panel ./

# 5. 重启服务
./scripts/run.sh start
```

## 📊 性能优化

### 系统优化建议
1. **内存**: 建议至少1GB RAM，重度使用建议2GB+
2. **存储**: 使用SSD存储提升数据库性能
3. **网络**: 确保稳定的网络连接
4. **备份**: 定期备份`data/`目录

### 监控建议
- 定期检查系统资源使用情况
- 监控面板访问日志
- 设置自动备份计划

## 🤝 贡献指南

### 报告问题
在 [GitHub Issues](https://github.com/ShourGG/tailamianban/issues) 中报告bug或提出功能建议。

### 功能请求
欢迎提出新功能建议，请详细描述使用场景和预期效果。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Terraria](https://terraria.org/) - 精彩的游戏
- [Go](https://golang.org/) - 高效的后端语言
- [Vue.js](https://vuejs.org/) - 优秀的前端框架
- [Naive UI](https://www.naiveui.com/) - 美观的UI组件库

## 📞 支持

- **GitHub**: [https://github.com/ShourGG/tailamianban](https://github.com/ShourGG/tailamianban)
- **Issues**: [报告问题](https://github.com/ShourGG/tailamianban/issues)
- **Discussions**: [讨论交流](https://github.com/ShourGG/tailamianban/discussions)

---

**⚠️ 免责声明**: 本软件仅供学习和个人使用，使用者需自行承担使用风险。请确保遵守相关法律法规和游戏服务条款。