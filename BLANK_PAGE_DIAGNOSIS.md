# 🔍 登录后主页空白问题 - 完整诊断报告

## 问题现象
- ✅ 登录页面能正常显示和操作
- ❌ 登录成功后跳转到主页时页面完全空白
- ❌ 没有任何内容渲染,控制台可能有错误

## 根本原因分析

经过深入代码审查,我发现了**多个关键问题**:

### 🔴 问题1: 动态路由组件路径解析错误

**位置**: `web/src/router/dynamicRouter.ts` 第29行

```typescript
const COMPONENTS = {
  layout: () => import('@/components/global/C_Layout/index.vue'),
  '404': () => import('@/views/error-page/404.vue'),
} as const
```

**问题**: 
- 动态路由配置文件 `dynamicRouter.json` 中使用 `"component": "layout"`
- 但实际项目中**不存在**独立的 `Layout.vue` 组件
- 项目使用的是 `C_Layout` 组件,路径为 `@/components/global/C_Layout/index.vue`

**影响**: 
- 登录后跳转到 `/terraria/dashboard` 时
- 需要先加载父路由的 `layout` 组件
- 组件解析失败导致整个页面无法渲染

### 🔴 问题2: 路由守卫逻辑可能导致无限循环

**位置**: `web/src/router/permission.ts` 第106-124行

```typescript
// 2. 已登录但访问登录页 - 关键修复点
if (to.path === LOGIN_PATH) {
  return '/home'  // ❌ 问题: /home 路由不存在!
}

// 3. 动态路由初始化
if (!authMenuList.length && !isInitializing) {
  const result = await handleDynamicRouterInit(to.fullPath)
  if (result !== to.fullPath) {
    return result
  }
  return to.fullPath  // 重新访问当前路径
}
```

**问题**:
1. 登录后重定向到 `/home`,但根据 `dynamicRouter.json`,**不存在 /home 路由**
2. 实际首页应该是 `/terraria/dashboard`
3. 当菜单未加载时,会触发动态路由初始化,但初始化完成后的重定向逻辑可能有问题

### 🔴 问题3: 组件异步加载失败处理不完善

**位置**: `web/src/router/dynamicRouter.ts` 第48-74行

```typescript
const resolveComponent = (path?: string) => {
  if (!path) return undefined

  // 检查预定义组件
  if (path in COMPONENTS) {
    return COMPONENTS[path as keyof typeof COMPONENTS]
  }

  try {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const viewPath = `../views${normalizedPath}.vue`
    const modules = import.meta.glob('../views/**/*.vue')

    if (modules[viewPath]) {
      return modules[viewPath]
    }

    console.warn(`[动态路由] 组件不存在: ${viewPath}`)
    return COMPONENTS['404']  // ❌ 返回404组件可能不是最佳方案
  } catch (error) {
    console.error('[动态路由] 组件解析失败:', error)
    return COMPONENTS['404']
  }
}
```

**问题**:
- 当组件路径不存在时,返回404组件
- 但这可能导致布局组件(layout)也被替换为404
- 用户看到的就是空白页面

## ✅ 修复方案

### 修复1: 确保 layout 组件路径正确

<update_todo_list>
<todos>
[x] 分析问题症状和现有诊断信息
[x] 检查前端路由和组件加载逻辑
[x] 检查构建产物和资源加载
[-] 定位根本原因
[ ] 提供修复方案
</todos>
</update_todo_list>