# 🔍 页面空白问题诊断与修复报告

## ❌ 问题现象
访问泰拉瑞亚管理面板时，页面完全空白，没有任何数据显示。

## 🎯 根本原因

### 问题分析
经过深入排查，发现了**API 基础路径不匹配**的关键问题：

1. **前端 API 配置不一致**
   - `web/src/utils/api.ts` 使用 baseURL: `/api`
   - `web/src/axios/request.ts` 使用 baseURL: `/api/v1`
   - 两个 axios 实例配置不同

2. **后端路由配置**
   - 所有 API 路由都在 `/api/v1` 下（见 `internal/api/routes.go`）
   - 例如：`/api/v1/server/status`、`/api/v1/players/` 等

3. **影响范围**
   - Dashboard 页面（`/terraria/dashboard`）使用 `web/src/utils/api.ts`
   - 调用 `getServerStatus()`、`getOnlinePlayers()`、`getSystemStats()` 等 API
   - 所有请求发送到错误的路径 `/api/xxx` 而不是 `/api/v1/xxx`
   - 导致所有 API 返回 404，页面无法加载数据

## ✅ 修复方案

### 修改内容
修改 `web/src/utils/api.ts` 第 8 行：

```typescript
// 修改前
baseURL: import.meta.env.VITE_API_BASE_URL || '/api',

// 修改后
baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
```

### 执行步骤
1. ✅ 修改 `web/src/utils/api.ts` 中的 baseURL
2. ✅ 重新构建前端：`npm run build`
3. ✅ 复制构建产物到 `cmd/dist/`
4. ✅ 重新编译后端（嵌入新的前端文件）
5. ⏳ 重启服务器并测试

## 📋 验证清单

### 前端验证
- [x] 前端构建成功（web/dist 目录存在）
- [x] API 基础路径已统一为 `/api/v1`
- [x] 环境变量配置正确（dev.env 和 prod.env）

### 后端验证
- [x] 前端文件已复制到 `cmd/dist/`
- [x] 后端程序已重新编译
- [ ] 服务器启动时显示 `[OK] Frontend assets embedded`
- [ ] 访问 Dashboard 页面能看到数据

### API 测试
启动服务器后，测试以下 API：
```bash
# 测试服务器状态 API
curl http://localhost:8080/api/v1/server/status

# 测试在线玩家 API
curl http://localhost:8080/api/v1/players/online

# 测试系统统计 API
curl http://localhost:8080/api/v1/system/metrics
```

## 🚀 启动服务器

```bash
# Windows
.\terraria-panel.exe

# 或使用测试版本
.\terraria-panel-test.exe

# Linux
./terraria-panel-linux
```

访问地址：`http://localhost:8080`

## 📝 其他发现

### 项目中存在的 axios 实例
1. **`web/src/utils/api.ts`** - 用于 terraria API（已修复）
2. **`web/src/axios/request.ts`** - 用于认证 API（配置正确）

### 建议优化
- 考虑统一使用一个 axios 实例，避免配置不一致
- 或者在项目文档中明确说明两个实例的使用场景

## 🔧 如何避免类似问题

1. **统一 API 配置**：使用单一的 axios 实例或配置文件
2. **添加 API 测试**：确保前后端路由匹配
3. **错误日志监控**：在开发环境显示详细的 API 错误信息
4. **文档维护**：记录所有 API 路径规范

---

**修复日期**：2025-10-03
**修复人员**：AI Assistant
**问题级别**：严重（导致页面完全无法使用）

