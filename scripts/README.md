# 🧠 智能 TypeScript 类型管理工具

一套实用的 TypeScript 类型分析和管理工具，专为 Vue 3 + TypeScript 项目设计。帮你自动找出项目中那些没用的类型、重复的定义，还有各种类型错误。

## 📋 目录

- [为什么需要这个工具](#为什么需要这个工具)
- [快速开始](#快速开始)
- [详细配置](#详细配置)
- [命令使用](#命令使用)
- [生成的文件](#生成的文件)
- [实际使用场景](#实际使用场景)
- [进阶用法](#进阶用法)
- [常见问题](#常见问题)

## 为什么需要这个工具

### 你肯定遇到过这些问题

- **类型定义一大堆，不知道哪些还在用**: 删了怕出问题，不删又占地方
- **同一个东西定义了好几遍**: `UserInfo`、`User`、`UserType` 到处都是
- **导入路径老是报错**: `Cannot find module '@/types/xxx'`
- **编译慢得要死**: IDE 卡得不行，类型检查半天出不来结果
- **重构的时候不敢动**: 改个类型名字，不知道会影响多少地方

### 不用这个工具会怎样

- 每次改代码都心惊胆战
- 新同事看代码一脸懵逼
- 项目越来越难维护
- 编译时间越来越长
- 线上经常出奇怪的类型错误

## 快速开始

### 第一步：准备环境

确保你的项目有这些：

- Node.js 16 以上
- TypeScript 4 以上
- 最好是 Vue 3 项目（不是也能用）

### 第二步：下载脚本文件

把这些文件保存到你的项目 `scripts` 目录：

```bash
mkdir scripts
```

然后把以下4个文件下载到 `scripts` 目录：

- `smart-type-tools.js` - 核心工具
- `smart-type-manager.js` - 类型分析器
- `smart-type-validator.js` - 类型检查器
- `type-detailed-report.js` - 详细报告生成器

### 第三步：配置 package.json

在你的 `package.json` 中添加：

```json
{
  "type": "module",
  "scripts": {
    "type:analyze": "node scripts/smart-type-manager.js",
    "type:validate": "node scripts/smart-type-validator.js",
    "type:check": "npm run type:analyze && npm run type:validate",
    "type:fix": "npm run type:validate -- --auto-fix",
    "type:detailed": "node scripts/type-detailed-report.js",
    "type:cleanup": "npm run type:detailed",
    "type:guide": "npm run type:detailed && echo '📋 详细清理指南已生成在: scripts/_look-file_/TYPE_CLEANUP_GUIDE.md'"
  }
}
```

### 第四步：试试看

```bash
# 基础检查
npm run type:check

# 生成详细清理指南
npm run type:detailed
```

## 详细配置

### 项目结构

```
你的项目/
├── scripts/
│   ├── smart-type-tools.js          # 核心工具
│   ├── smart-type-manager.js        # 类型分析
│   ├── smart-type-validator.js      # 类型验证
│   ├── type-detailed-report.js      # 报告生成
│   └── _look-file_/                 # 自动生成结果
│       ├── type-analysis-report.json
│       ├── TYPE_CLEANUP_GUIDE.md    ⭐ 主要看这个
│       └── cleanup-types.sh
├── src/                             # 你的代码
├── package.json
└── tsconfig.json
```

### 让 ESLint 和 TypeScript 忽略 scripts 目录

创建 `.eslintignore` 文件：

```
scripts/
```

更新 `tsconfig.json`：

```json
{
  "exclude": ["scripts", "node_modules", "dist"]
}
```

## 命令使用

### 基础命令配置

这些是最常用的命令，直接复制到你的 `package.json` 的 `scripts` 部分：

```json
{
  "scripts": {
    "type:analyze": "node scripts/smart-type-manager.js",
    "type:validate": "node scripts/smart-type-validator.js",
    "type:check": "npm run type:analyze && npm run type:validate",
    "type:detailed": "node scripts/type-detailed-report.js"
  }
}
```

**使用场景**：

- `type:analyze` - 想知道有多少没用的类型时用
- `type:validate` - 检查有没有类型错误时用
- `type:check` - 全面检查，日常开发用这个
- `type:detailed` - 想要详细清理指南时用

### 进阶命令配置

如果你想要更多功能，加上这些：

```json
{
  "scripts": {
    "type:fix": "npm run type:validate -- --auto-fix",
    "type:cleanup": "npm run type:detailed",
    "type:guide": "npm run type:detailed && echo '📋 详细指南: scripts/_look-file_/TYPE_CLEANUP_GUIDE.md'",
    "type:components": "node scripts/smart-type-manager.js --include 'src/components/**/*.vue'",
    "type:utils": "node scripts/smart-type-manager.js --include 'src/utils/**/*.ts'",
    "type:stores": "node scripts/smart-type-manager.js --include 'src/stores/**/*.ts'"
  }
}
```

**使用场景**：

- `type:fix` - 想自动修复一些简单问题时用
- `type:cleanup` - 和 type:detailed 一样，名字更直观
- `type:guide` - 生成指南后直接提示文件位置
- `type:components` - 只想检查组件的类型时用
- `type:utils` - 只想检查工具函数时用
- `type:stores` - 只想检查状态管理时用

### Git 钩子配置

想要提交代码前自动检查，在 `package.json` 加上：

```json
{
  "scripts": {
    "pre-commit": "npm run type:validate",
    "pre-push": "npm run type:check"
  }
}
```

配合 husky 使用：

```bash
npm install --save-dev husky
npx husky add .husky/pre-commit "npm run pre-commit"
```

### CI/CD 配置

如果你用 GitHub Actions，在 `package.json` 加上：

```json
{
  "scripts": {
    "type:ci": "npm run type:check && node -e \"const report = require('./scripts/_look-file_/type-analysis-report.json'); if (report.summary.healthScore < 80) process.exit(1);\"",
    "type:report": "npm run type:detailed && echo 'CI报告已生成'"
  }
}
```

### 开发调试配置

开发时用这些命令调试：

```json
{
  "scripts": {
    "type:debug": "DEBUG=1 npm run type:detailed",
    "type:verbose": "NODE_ENV=development npm run type:check",
    "type:help": "node scripts/smart-type-manager.js --help"
  }
}
```

## 生成的文件

运行命令后，会在 `scripts/_look-file_/` 目录生成这些文件：

### 1. TYPE_CLEANUP_GUIDE.md ⭐ 主要看这个

这是给人看的详细清理指南，包含：

```markdown
# TypeScript 类型清理指南

## 问题统计

- 未使用类型: 32 个
- 重复定义: 23 个
- 类型错误: 1 个

## 未使用的类型清理

### 1. UnusedInterface

- 文件: src/types/user.ts
- 位置: 第 15 行
- 建议: 可以直接删除

### 2. OldUserType

- 文件: src/components/User.vue
- 位置: 第 8 行
- 建议: 已被 UserInfo 替代，可删除
```

### 2. type-analysis-report.json

这是给程序看的数据文件，CI/CD 会用到。

### 3. cleanup-types.sh

自动生成的清理脚本，告诉你具体怎么清理。

## 实际使用场景

### 场景1：日常开发

**情况**：写代码时想确保类型没问题

**配置**：

```json
{
  "scripts": {
    "dev:check": "npm run type:check && npm run dev"
  }
}
```

**使用**：

```bash
npm run dev:check
```

### 场景2：重构代码

**情况**：要重构一个模块，不知道哪些类型还在用

**配置**：

```json
{
  "scripts": {
    "refactor:prepare": "npm run type:detailed && echo '重构前请查看: scripts/_look-file_/TYPE_CLEANUP_GUIDE.md'",
    "refactor:check": "npm run type:check"
  }
}
```

**使用**：

```bash
# 重构前
npm run refactor:prepare

# 重构后
npm run refactor:check
```

### 场景3：代码review

**情况**：review 代码时想检查类型质量

**配置**：

```json
{
  "scripts": {
    "review:types": "npm run type:detailed",
    "review:health": "node -e \"const r = require('./scripts/_look-file_/type-analysis-report.json'); console.log('健康分数:', r.summary.healthScore);\""
  }
}
```

### 场景4：项目清理

**情况**：项目用了很久，想清理一下无用代码

**配置**：

```json
{
  "scripts": {
    "cleanup:types": "npm run type:detailed",
    "cleanup:verify": "npm run type:check",
    "cleanup:all": "npm run cleanup:types && echo '请按照指南清理，然后运行 npm run cleanup:verify'"
  }
}
```

### 场景5：新人入职

**情况**：新同事需要了解项目类型结构

**配置**：

```json
{
  "scripts": {
    "onboard:types": "npm run type:detailed && echo '新人必看: scripts/_look-file_/TYPE_CLEANUP_GUIDE.md'",
    "onboard:check": "npm run type:check && echo '类型检查通过，可以开始开发了'"
  }
}
```

### 场景6：发布前检查

**情况**：发版前确保类型质量

**配置**：

```json
{
  "scripts": {
    "release:check": "npm run type:check",
    "release:report": "npm run type:detailed && node -e \"const r = require('./scripts/_look-file_/type-analysis-report.json'); if (r.summary.healthScore < 85) { console.log('❌ 类型健康分数过低，建议优化后发布'); process.exit(1); } else { console.log('✅ 类型质量良好，可以发布'); }\"",
    "pre-release": "npm run release:report && npm run build"
  }
}
```

## 进阶用法

### 自定义检查范围

只检查特定目录：

```json
{
  "scripts": {
    "type:pages": "node scripts/smart-type-manager.js --include 'src/pages/**/*.{vue,ts}'",
    "type:api": "node scripts/smart-type-manager.js --include 'src/api/**/*.ts'",
    "type:shared": "node scripts/smart-type-manager.js --include 'src/shared/**/*.ts'"
  }
}
```

### 自定义输出位置

```json
{
  "scripts": {
    "type:report-daily": "node scripts/smart-type-manager.js --output './reports/daily-$(date +%Y%m%d).json'",
    "type:report-release": "npm run type:detailed && cp scripts/_look-file_/TYPE_CLEANUP_GUIDE.md ./docs/type-report.md"
  }
}
```

### 配合其他工具

```json
{
  "scripts": {
    "quality:all": "npm run lint && npm run type:check && npm run test",
    "fix:all": "npm run lint:fix && npm run type:fix",
    "check:all": "npm run type:check && npm run build && npm run test"
  }
}
```

## 常见问题

### Q: 为什么运行报错 "Cannot find module"？

**A: 确保配置正确**

```json
{
  "type": "module"
}
```

没有这个配置就加上，有了就检查脚本文件是否存在。

### Q: 为什么没有生成 TYPE_CLEANUP_GUIDE.md？

**A: 要运行正确的命令**

```bash
npm run type:detailed  # 这个才会生成指南
npm run type:check     # 这个只是检查，不生成指南
```

### Q: 怎么让 ESLint 不检查 scripts 目录？

**A: 创建 .eslintignore 文件**

```
scripts/
node_modules/
dist/
```

### Q: 内存不够怎么办？

**A: 增加内存限制**

```json
{
  "scripts": {
    "type:check": "NODE_OPTIONS='--max-old-space-size=4096' npm run type:analyze && npm run type:validate"
  }
}
```

### Q: 想要定时检查怎么办？

**A: 配置定时任务**

```json
{
  "scripts": {
    "type:cron": "npm run type:detailed && echo '定时检查完成: $(date)'"
  }
}
```

然后在 crontab 中添加：

```bash
0 9 * * * cd /path/to/your/project && npm run type:cron
```

### Q: 怎么集成到 CI/CD？

**A: 添加 CI 命令**

```json
{
  "scripts": {
    "ci:type-check": "npm run type:check && node -e \"const r = require('./scripts/_look-file_/type-analysis-report.json'); if (r.summary.healthScore < 80) process.exit(1);\""
  }
}
```

然后在 CI 配置中使用 `npm run ci:type-check`。

### Q: 脚本运行很慢怎么办？

**A: 可以分步骤运行**

```json
{
  "scripts": {
    "type:quick": "npm run type:validate",
    "type:full": "npm run type:analyze && npm run type:validate",
    "type:background": "nohup npm run type:detailed > type-check.log 2>&1 &"
  }
}
```

### Q: 想要更详细的调试信息怎么办？

**A: 启用调试模式**

```json
{
  "scripts": {
    "type:debug": "DEBUG=1 NODE_ENV=development npm run type:detailed",
    "type:trace": "npm run type:check 2>&1 | tee debug.log"
  }
}
```

### Q: 怎么忽略某些文件或目录？

**A: 修改脚本中的配置**

你可以创建自定义命令：

```json
{
  "scripts": {
    "type:no-tests": "node scripts/smart-type-manager.js --exclude '**/*.test.ts,**/*.spec.ts'",
    "type:only-src": "node scripts/smart-type-manager.js --include 'src/**/*.ts' --exclude 'src/test/**'"
  }
}
```

### Q: 想要在 VS Code 中快速运行怎么办？

**A: 配置 VS Code 任务**

创建 `.vscode/tasks.json`：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "类型检查",
      "type": "npm",
      "script": "type:check",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "生成清理指南",
      "type": "npm",
      "script": "type:detailed",
      "group": "build"
    }
  ]
}
```

然后按 `Ctrl+Shift+P`，输入 "Tasks: Run Task" 就能快速运行了。

---

## 总结

这套工具就是为了解决 TypeScript 项目中那些让人头疼的类型问题。配置好后，你就能：

- 知道哪些类型没人用了，可以删掉
- 找出重复定义的类型，统一管理
- 快速定位类型错误的具体位置
- 生成详细的清理指南，按步骤执行

**最重要的是**，直接运行 `npm run type:detailed`，然后看 `scripts/_look-file_/TYPE_CLEANUP_GUIDE.md` 文件，里面有详细的清理步骤。

**日常使用就记住两个命令**：

- `npm run type:check` - 日常检查
- `npm run type:detailed` - 需要清理时用

**完整的 package.json 配置示例**：

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",

    "type:analyze": "node scripts/smart-type-manager.js",
    "type:validate": "node scripts/smart-type-validator.js",
    "type:check": "npm run type:analyze && npm run type:validate",
    "type:detailed": "node scripts/type-detailed-report.js",
    "type:fix": "npm run type:validate -- --auto-fix",
    "type:cleanup": "npm run type:detailed",

    "type:components": "node scripts/smart-type-manager.js --include 'src/components/**/*.vue'",
    "type:utils": "node scripts/smart-type-manager.js --include 'src/utils/**/*.ts'",
    "type:stores": "node scripts/smart-type-manager.js --include 'src/stores/**/*.ts'",

    "pre-commit": "npm run type:validate",
    "ci:type-check": "npm run type:check && node -e \"const r = require('./scripts/_look-file_/type-analysis-report.json'); if (r.summary.healthScore < 80) process.exit(1);\"",

    "quality:all": "npm run lint && npm run type:check && npm run test"
  }
}
```

就这么简单！现在你的 TypeScript 项目再也不会有乱七八糟的类型问题了。存在。

### Q: 为什么没有生成 TYPE_CLEANUP_GUIDE.md？

**A: 要运行正确的命令**

```bash
npm run type:detailed  # 这个才会生成指南
npm run type:check     # 这个只是检查，不生成指南
```

### Q: 怎么让 ESLint 不检查 scripts 目录？

**A: 创建 .eslintignore 文件**

```
scripts/
node_modules/
dist/
```

### Q: 内存不够怎么办？

**A: 增加内存限制**

```json
{
  "scripts": {
    "type:check": "NODE_OPTIONS='--max-old-space-size=4096' npm run type:analyze && npm run type:validate"
  }
}
```

### Q: 想要定时检查怎么办？

**A: 配置定时任务**

```json
{
  "scripts": {
    "type:cron": "npm run type:detailed && echo '定时检查完成: $(date)'"
  }
}
```

然后在 crontab 中添加：

```bash
0 9 * * * cd /path/to/your/project && npm run type:cron
```

### Q: 怎么集成到 CI/CD？

**A: 添加 CI 命令**

```json
{
  "scripts": {
    "ci:type-check": "npm run type:check && node -e \"const r = require('./scripts/_look-file_/type-analysis-report.json'); if (r.summary.healthScore < 80) process.exit(1);\""
  }
}
```

然后在 CI 配置中使用 `npm run ci:type-check`。

---

## 总结

这套工具就是为了解决 TypeScript 项目中那些让人头疼的类型问题。配置好后，你就能：

- 知道哪些类型没人用了，可以删掉
- 找出重复定义的类型，统一管理
- 快速定位类型错误的具体位置
- 生成详细的清理指南，按步骤执行

**最重要的是**，直接运行 `npm run type:detailed`，然后看 `scripts/_look-file_/TYPE_CLEANUP_GUIDE.md` 文件，里面有详细的清理步骤。

**日常使用就记住两个命令**：

- `npm run type:check` - 日常检查
- `npm run type:detailed` - 需要清理时用

就这么简单！存在。

### Q: 为什么没有生成 TYPE_CLEANUP_GUIDE.md？

**A: 要运行正确的命令**

```bash
npm run type:detailed  # 这个才会生成指南
npm run type:check     # 这个只是检查，不生成指南
```

### Q: 怎么让 ESLint 不检查 scripts 目录？

**A: 创建 .eslintignore 文件**

```
scripts/
node_modules/
dist/
```

### Q: 内存不够怎么办？

**A: 增加内存限制**

```json
{
  "scripts": {
    "type:check": "NODE_OPTIONS='--max-old-space-size=4096' npm run type:analyze && npm run type:validate"
  }
}
```

### Q: 想要定时检查怎么办？

**A: 配置定时任务**

```json
{
  "scripts": {
    "type:cron": "npm run type:detailed && echo '定时检查完成: $(date)'"
  }
}
```

然后在 crontab 中添加：

```bash
0 9 * * * cd /path/to/your/project && npm run type:cron
```

### Q: 怎么集成到 CI/CD？

**A: 添加 CI 命令**

```json
{
  "scripts": {
    "ci:type-check": "npm run type:check && node -e \"const r = require('./scripts/_look-file_/type-analysis-report.json'); if (r.summary.healthScore < 80) process.exit(1);\""
  }
}
```

然后在 CI 配置中使用 `npm run ci:type-check`。

---

## 总结

这套工具就是为了解决 TypeScript 项目中那些让人头疼的类型问题。配置好后，你就能：

- 知道哪些类型没人用了，可以删掉
- 找出重复定义的类型，统一管理
- 快速定位类型错误的具体位置
- 生成详细的清理指南，按步骤执行

**最重要的是**，直接运行 `npm run type:detailed`，然后看 `scripts/_look-file_/TYPE_CLEANUP_GUIDE.md` 文件，里面有详细的清理步骤。

**日常使用就记住两个命令**：

- `npm run type:check` - 日常检查
- `npm run type:detailed` - 需要清理时用

就这么简单！除其他位置的重复定义 3. 更新所有导入引用

````

### 3. cleanup-types.sh

**用途**: 自动化清理脚本

**内容示例**:
```bash
#!/bin/bash
# 自动生成的类型清理脚本
# 执行前请备份您的代码！

echo "🗑️ 清理未使用的类型定义..."
echo "  - UnusedInterface in src/types/user.ts:15"
echo "  - OldType in src/utils/helpers.ts:8"

echo "🔗 处理重复的类型定义..."
echo "  - 合并重复类型: UserType"

echo "✅ 清理分析完成！"
echo "📋 请查看详细指南: scripts/_look-file_/TYPE_CLEANUP_GUIDE.md"
````

## 🔍 使用示例

### 日常工作流

```bash
# 1. 每日检查（推荐）
npm run type:check

# 2. 发现问题时生成详细指南
npm run type:detailed

# 3. 查看详细指南
cat scripts/_look-file_/TYPE_CLEANUP_GUIDE.md

# 4. 在编辑器中打开指南
code scripts/_look-file_/TYPE_CLEANUP_GUIDE.md

# 5. 修复问题后重新验证
npm run type:check
```

### 重构项目时

```bash
# 1. 生成清理指南
npm run type:cleanup

# 2. 按优先级修复（参考指南）
# 先修复：🔴 TypeScript 编译错误
# 再修复：🟠 重复类型定义
# 最后：🟡 未使用类型定义

# 3. 自动修复部分问题
npm run type:fix

# 4. 验证修复结果
npm run type:check
```

### 特定模块检查

```bash
# 检查组件类型
npm run type:components

# 检查工具函数类型
npm run type:utils

# 检查状态管理类型
npm run type:stores
```

## 🎛️ 高级用法

### 1. 自定义配置

创建 `scripts/type-config.js`:

```javascript
// scripts/type-config.js
export const customConfig = {
  manager: {
    include: ['src/**/*.{ts,vue}'],
    exclude: ['**/*.test.ts', '**/*.spec.ts'],
    healthThreshold: 85,
    outputDir: 'reports',
  },
  validator: {
    autoFix: false,
    strictMode: true,
    ignoreWarnings: false,
  },
}
```

### 2. 程序化使用

```javascript
// build-script.js
import {
  SmartTypeManager,
  SmartTypeValidator,
} from './scripts/smart-type-tools.js'

async function buildQualityCheck() {
  const manager = new SmartTypeManager()
  const result = await manager.run()

  if (result.report.summary.healthScore < 80) {
    console.warn('⚠️ 类型健康分数过低，建议优化后再构建')
    process.exit(1)
  }

  const validator = new SmartTypeValidator()
  const validation = await validator.validate()

  if (!validation.success) {
    console.error('❌ 存在类型错误，停止构建')
    process.exit(1)
  }

  console.log('✅ 类型检查通过，开始构建...')
}
```

### 3. 监控脚本

```javascript
// scripts/type-monitor.js
import { SmartTypeManager } from './smart-type-tools.js'
import fs from 'fs'

async function monitorTypes() {
  const manager = new SmartTypeManager()
  const result = await manager.run()

  // 记录历史数据
  const history = {
    timestamp: new Date().toISOString(),
    healthScore: result.report.summary.healthScore,
    unusedTypes: result.report.summary.unusedTypes,
    duplicates: result.report.summary.duplicateDefinitions,
  }

  const historyFile = 'scripts/_look-file_/type-history.json'
  let historyData = []

  if (fs.existsSync(historyFile)) {
    historyData = JSON.parse(fs.readFileSync(historyFile, 'utf8'))
  }

  historyData.push(history)
  fs.writeFileSync(historyFile, JSON.stringify(historyData, null, 2))

  console.log('📊 类型监控数据已记录')
}

// 定时监控
setInterval(monitorTypes, 24 * 60 * 60 * 1000) // 每天运行一次
```

## 🚀 CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/type-check.yml
name: TypeScript 类型检查

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  type-check:
    runs-on: ubuntu-latest

    steps:
      - name: 检出代码
        uses: actions/checkout@v3

      - name: 设置 Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: 安装依赖
        run: npm ci

      - name: 运行类型分析
        run: npm run type:analyze

      - name: 运行类型验证
        run: npm run type:validate

      - name: 检查健康分数
        run: |
          SCORE=$(node -p "require('./scripts/_look-file_/type-analysis-report.json').summary.healthScore")
          echo "类型健康分数: $SCORE"
          if [ $SCORE -lt 80 ]; then
            echo "❌ 健康分数过低，需要改进"
            exit 1
          fi

      - name: 上传类型报告
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: type-analysis-report
          path: scripts/_look-file_/

      - name: 评论 PR（如果有问题）
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const reportPath = 'scripts/_look-file_/TYPE_CLEANUP_GUIDE.md';
            if (fs.existsSync(reportPath)) {
              const report = fs.readFileSync(reportPath, 'utf8');
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: `## 🔍 TypeScript 类型检查报告\n\n${report.substring(0, 65000)}`
              });
            }
```

### GitLab CI

```yaml
# .gitlab-ci.yml
type-check:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run type:check
    - |
      SCORE=$(node -p "require('./scripts/_look-file_/type-analysis-report.json').summary.healthScore")
      echo "类型健康分数: $SCORE"
      if [ $SCORE -lt 80 ]; then
        echo "❌ 健康分数过低，需要改进"
        exit 1
      fi
  artifacts:
    when: always
    paths:
      - scripts/_look-file_/
    expire_in: 1 week
  only:
    - merge_requests
    - main
    - develop
```

### Husky Git Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run type:validate",
      "pre-push": "npm run type:check"
    }
  }
}
```

或使用新版 Husky：

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 运行类型检查..."
npm run type:validate

if [ $? -ne 0 ]; then
  echo "❌ 类型检查失败，请修复后再提交"
  echo "💡 运行 'npm run type:detailed' 获取详细修复指南"
  exit 1
fi
```

## 🐛 故障排除

### 常见问题

#### 1. 脚本无法运行

**问题**: `Cannot find module` 错误

**解决方案**:

```bash
# 确保文件存在
ls scripts/smart-type-tools.js

# 检查 package.json 配置
cat package.json | grep '"type"'

# 确保是 ES 模块
# package.json 中应该有 "type": "module"
```

#### 2. 权限问题

**问题**: `Permission denied` 错误

**解决方案**:

```bash
# 给脚本文件添加执行权限
chmod +x scripts/*.js

# 或者直接用 node 运行
node scripts/smart-type-manager.js
```

#### 3. TypeScript 编译错误

**问题**: `tsc: command not found`

**解决方案**:

```bash
# 安装 TypeScript
npm install -g typescript

# 或使用项目本地版本
npx tsc --version

# 检查 tsconfig.json 是否存在
ls tsconfig.json
```

#### 4. 文件未生成

**问题**: `TYPE_CLEANUP_GUIDE.md` 文件未生成

**解决方案**:

```bash
# 确保运行正确的命令
npm run type:detailed  # 不是 type:check

# 检查输出目录
ls scripts/_look-file_/

# 手动创建目录
mkdir -p scripts/_look-file_

# 查看脚本输出
npm run type:detailed 2>&1 | tee debug.log
```

#### 5. 内存不足

**问题**: `JavaScript heap out of memory`

**解决方案**:

```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run type:check

# 或在 package.json 中配置
{
  "scripts": {
    "type:check": "NODE_OPTIONS='--max-old-space-size=4096' npm run type:analyze && npm run type:validate"
  }
}
```

### 调试模式

```bash
# 启用详细输出
DEBUG=1 npm run type:detailed

# 查看详细错误信息
NODE_ENV=development npm run type:check

# 生成调试日志
npm run type:check 2>&1 | tee type-check-debug.log
```

### 性能优化

```bash
# 只检查特定文件类型
npm run type:analyze -- --include "src/**/*.ts"

# 排除大文件
npm run type:analyze -- --exclude "src/assets/**"

# 分步骤运行
npm run type:analyze
npm run type:validate
# 然后才运行
npm run type:detailed
```

### 获取帮助

```bash
# 查看命令帮助
node scripts/smart-type-manager.js --help
node scripts/smart-type-validator.js --help

# 查看版本信息
node scripts/smart-type-validator.js --version
```

---

## 🎉 总结

这套智能 TypeScript 类型管理工具能够：

- ✅ **自动检测** 项目中的类型问题
- ✅ **精确定位** 问题的具体位置和行号
- ✅ **生成详细** 的 Markdown 清理指南
- ✅ **提供具体** 的修复步骤和建议
- ✅ **支持自动化** 修复部分问题
- ✅ **集成 CI/CD** 流程
- ✅ **零外部依赖** 纯 Node.js 实现

**开始使用**:

```bash
npm run type:detailed
```

**查看指南**:

```bash
code scripts/_look-file_/TYPE_CLEANUP_GUIDE.md
```

让 TypeScript 项目更加健康和可维护！🚀
