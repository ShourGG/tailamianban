# 脚本更新说明

## 问题说明

如果您在运行旧版本脚本时遇到 `update_script: command not found` 错误，这是因为旧版本脚本缺少自动更新功能。

## 手动更新脚本步骤

### 方法 1: 直接下载最新脚本（推荐）

```bash
# 备份旧脚本
sudo cp panel.sh panel.sh.backup

# 下载最新脚本（使用国内加速）
sudo curl -L https://ghproxy.com/https://raw.githubusercontent.com/ShourGG/tailamianban/main/panel.sh -o panel.sh

# 赋予执行权限
sudo chmod +x panel.sh

# 运行新脚本
sudo bash panel.sh
```

### 方法 2: 使用 GitHub 直连（需要良好的网络环境）

```bash
# 备份旧脚本
sudo cp panel.sh panel.sh.backup

# 下载最新脚本
sudo curl -L https://raw.githubusercontent.com/ShourGG/tailamianban/main/panel.sh -o panel.sh

# 赋予执行权限
sudo chmod +x panel.sh

# 运行新脚本
sudo bash panel.sh
```

### 方法 3: 使用其他加速镜像

如果上述方法失败，可以尝试其他镜像：

```bash
# 镜像 1
sudo curl -L https://mirror.ghproxy.com/https://raw.githubusercontent.com/ShourGG/tailamianban/main/panel.sh -o panel.sh

# 镜像 2
sudo curl -L https://gh.api.99988866.xyz/https://raw.githubusercontent.com/ShourGG/tailamianban/main/panel.sh -o panel.sh

# 镜像 3
sudo curl -L https://github.akams.cn/https://raw.githubusercontent.com/ShourGG/tailamianban/main/panel.sh -o panel.sh
```

## 更新后的新功能

脚本 v2.7 版本包含以下功能：

1. ✅ 安装面板
2. ✅ 更新面板（支持自动检测版本并更新）
3. ✅ **更新脚本（自动更新脚本本身到最新版本）**
4. ✅ 启动/停止/重启面板
5. ✅ 查看日志和状态
6. ✅ 修改端口
7. ✅ 卸载面板
8. ✅ 多镜像源自动切换（10个国内加速镜像）
9. ✅ 自动备份和回滚机制
10. ✅ 支持 GitHub Releases 文件加速下载

## 验证更新

更新后运行脚本，应该能看到：

```
╔══════════════════════════════════════════════════════════╗
║          🎮 泰拉瑞亚服务器管理面板                     ║
║             Terraria Server Panel                     ║
║                                                          ║
║               管理脚本 v2.7                          ║
╚══════════════════════════════════════════════════════════╝
```

如果看到 `管理脚本 v2.7`，说明更新成功！

## 一键更新命令（推荐）

```bash
sudo bash -c "curl -L https://ghproxy.com/https://raw.githubusercontent.com/ShourGG/tailamianban/main/panel.sh -o panel.sh && chmod +x panel.sh && ./panel.sh"
```

这条命令会：
1. 下载最新脚本
2. 赋予执行权限
3. 自动运行脚本

## 常见问题

**Q: 下载脚本时提示 "curl: command not found"**

A: 需要先安装 curl：
```bash
# Debian/Ubuntu
sudo apt update && sudo apt install curl -y

# CentOS/RHEL
sudo yum install curl -y
```

**Q: 所有镜像都无法访问怎么办？**

A: 请检查：
1. 服务器网络连接是否正常
2. 是否需要配置代理
3. 防火墙是否阻止了 HTTPS 连接
4. 可以尝试使用 VPN 或代理服务

**Q: 如何确认脚本是最新版本？**

A: 运行脚本后，在 Banner 中查看版本号，或者查看脚本文件头部的版本标识。