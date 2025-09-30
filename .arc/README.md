# .arc - 泰拉瑞亚面板项目核心架构

## 概述

`.arc/` 目录是泰拉瑞亚面板项目的**单一事实来源 (Single Source of Truth)**，包含了项目的所有核心架构、设计决策、编码规范和安全策略。

## 目录结构

```
.arc/
├── README.md                           # 本文件 - 架构概览
├── domain_model/                       # 领域模型
│   └── README.md                       # 领域驱动设计文档
├── architecture/                       # 架构设计
│   ├── principles.md                   # 架构原则
│   └── adr/                           # 架构决策记录
│       └── 0001-initial-architecture-choice.md
├── coding_standards/                   # 编码规范
│   ├── go_standards.md                # Go语言编码规范
│   └── typescript_standards.md       # TypeScript编码规范
└── security/                          # 安全策略
    └── threat_model.md                # 威胁模型和安全策略
```

## 核心设计理念

### 1. 简单至上 (Simplicity First)
- **单一二进制部署** - 一个文件包含所有功能
- **零配置启动** - 默认配置开箱即用
- **一键脚本管理** - run.sh处理所有操作

### 2. 安全优先 (Security First)
- **单端口策略** - 减少攻击面
- **零信任架构** - 默认拒绝，显式授权
- **内网隔离** - 泰拉瑞亚服务器不对外暴露

### 3. 现代化技术栈
- **后端**: Go + Gin + SQLite + embed
- **前端**: Vue3 + TypeScript + Naive UI + UnoCSS
- **部署**: systemd + 自动化脚本

## 技术架构概览

### 系统架构图
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   外部用户      │───▶│   防火墙:8080    │───▶│   泰拉瑞亚面板      │
└─────────────────┘    └──────────────────┘    │   (Go + Vue3)       │
                                               │                     │
                                               │   ┌─────────────┐   │
                                               │   │  SQLite DB  │   │
                                               │   └─────────────┘   │
                                               │                     │
                                               │   ┌─────────────┐   │
                                               │   │ 泰拉瑞亚服务器│   │
                                               │   │127.0.0.1:7777│   │
                                               │   └─────────────┘   │
                                               └─────────────────────┘
```

### 核心组件
1. **Web面板** - 用户界面和API服务
2. **服务器管理器** - 泰拉瑞亚服务器生命周期管理
3. **世界管理器** - 游戏世界文件管理
4. **玩家管理器** - 在线玩家和权限管理
5. **系统监控器** - 资源使用和性能监控

## 领域模型

### 限界上下文
1. **服务器管理上下文** - 服务器生命周期和配置
2. **世界管理上下文** - 游戏世界和备份
3. **玩家管理上下文** - 玩家数据和权限
4. **系统监控上下文** - 性能指标和告警
5. **面板管理上下文** - 用户认证和权限

### 核心聚合
- `TerrariaServer` - 泰拉瑞亚服务器聚合根
- `GameWorld` - 游戏世界聚合根
- `Player` - 玩家聚合根
- `SystemMetrics` - 系统指标聚合根
- `PanelUser` - 面板用户聚合根

## 架构决策记录 (ADR)

### ADR-0001: 初始架构选择
- **决策**: 采用Go + Vue3 + SQLite技术栈
- **理由**: 简单部署、高性能、现代化开发体验
- **状态**: 已接受

### ADR-0002: 前端性能优化决策
- **决策**: Spline 3D按需渲染、禁用透明度/抗锯齿、强制预构建
- **理由**: 解决机器人背景卡顿问题，性能提升60-80%
- **状态**: 已接受

### ADR-0003: 表单组件架构修复
- **决策**: 创建DynamicComponent组件支持动态布局加载
- **理由**: 修复登录表单输入框不显示的根本问题
- **状态**: 已接受

### 未来ADR计划
- ADR-0004: 数据库设计决策
- ADR-0005: 安全架构决策
- ADR-0006: 部署策略决策

## 编码规范

### Go语言规范
- 遵循官方Effective Go指南
- 使用gofmt、golint、go vet工具
- 错误处理优先，接口设计简洁
- 并发安全，性能优化

### TypeScript规范
- 启用严格模式，避免any类型
- 明确的类型定义和接口设计
- 合理使用泛型和工具类型
- 异步编程最佳实践

## 安全策略

### 威胁模型
基于STRIDE模型进行威胁分析：
- **身份欺骗** - 强密码策略、JWT认证
- **篡改** - 文件权限控制、输入验证
- **否认** - 详细审计日志
- **信息泄露** - 数据脱敏、访问控制
- **拒绝服务** - 频率限制、资源监控
- **权限提升** - 最小权限原则、多层验证

### 安全控制
- 认证：用户名密码 + JWT token
- 授权：基于角色的访问控制 (RBAC)
- 加密：HTTPS/TLS + 敏感数据加密
- 监控：安全事件检测和响应

## 部署架构

### 部署原则
1. **一键部署** - 下载即用，无依赖安装
2. **脚本管理** - run.sh统一管理服务
3. **系统服务** - systemd自动启动和监控
4. **安全配置** - 最小权限和防火墙保护

### 部署流程
```bash
# 1. 下载安装脚本
curl -fsSL https://raw.githubusercontent.com/ShourGG/tailamianban/main/install.sh | bash

# 2. 启动服务
./run.sh

# 3. 访问面板
http://服务器IP:8080
```

## 开发工作流

### 开发阶段
1. **需求分析** - 基于领域模型分析业务需求
2. **架构设计** - 遵循架构原则，记录ADR
3. **编码实现** - 严格遵循编码规范
4. **安全审查** - 基于威胁模型进行安全检查
5. **测试验证** - 单元测试、集成测试、安全测试

### 质量保证
- **代码审查** - 强制性代码审查流程
- **自动化测试** - CI/CD集成测试
- **安全扫描** - 静态代码分析和漏洞扫描
- **性能测试** - 负载测试和性能优化

## 项目治理

### 文档维护
- **定期更新** - 每个Sprint结束后更新相关文档
- **版本控制** - 所有文档纳入Git版本控制
- **审查流程** - 重要变更需要团队审查

### 架构演进
- **渐进式改进** - 避免大规模重构
- **向后兼容** - 保持API和数据格式兼容
- **技术债务管理** - 定期评估和清理技术债务

## 参考资源

### 技术文档
- [Go官方文档](https://golang.org/doc/)
- [Vue3官方文档](https://vuejs.org/)
- [TypeScript官方文档](https://www.typescriptlang.org/)
- [Naive UI文档](https://www.naiveui.com/)

### 架构指南
- [Domain-Driven Design](https://domainlanguage.com/ddd/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Microservices Patterns](https://microservices.io/)

### 安全资源
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [STRIDE威胁模型](https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)

## 联系信息

### 项目团队
- **项目负责人**: 老王暴躁技术流
- **架构师**: 项目架构团队
- **安全专家**: 安全团队

### 项目资源
- **GitHub仓库**: https://github.com/ShourGG/tailamianban
- **问题跟踪**: https://github.com/ShourGG/tailamianban/issues
- **安全报告**: security@example.com

---

**注意**: 本目录包含项目的核心架构信息，任何重大变更都应该通过正式的架构决策流程，并更新相应的ADR文档。

*最后更新: 2025-09-30*
*版本: 1.1.9.6*