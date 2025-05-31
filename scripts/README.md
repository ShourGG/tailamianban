# TypeScript 类型管理工具

一套用于管理和验证 TypeScript 项目中类型定义文件的自动化工具，特别适用于 Vue 3 + TypeScript 项目。

## 📋 工具概述

### 🔧 type-manager.js
**类型文件管理器** - 自动化类型文件的组织和维护
- 自动生成类型索引文件 (`index.d.ts`)
- 验证必需类型文件的完整性
- 执行 TypeScript 语法检查

### 🔍 type-validator.js
**类型一致性验证器** - 确保类型定义的规范性和一致性
- 验证命名空间使用的一致性
- 检查类型文件引用关系的正确性
- 提供详细的问题诊断和修复建议

## 🚀 快速开始

### 安装依赖

```bash
npm install --save-dev vue-tsc typescript
```

### 配置 package.json

```json
{
  "type": "module",
  "scripts": {
    "type:generate": "node scripts/type-manager.js",
    "type:validate": "node scripts/type-validator.js",
    "type:check": "npm run type:generate && npm run type:validate"
  }
}
```

## 📁 项目结构要求

```
src/
├── types/
│   ├── index.d.ts          # 自动生成的索引文件
│   ├── global.d.ts         # 全局类型和命名空间定义
│   ├── env.d.ts           # 环境变量类型定义
│   ├── unocss.d.ts        # UnoCSS 类型定义
│   └── modules/           # 模块化类型定义
│       ├── form.d.ts      # 表单相关类型
│       └── menu.d.ts      # 菜单相关类型
└── ...
```

## 🔧 type-manager.js 详细说明

### 主要功能

1. **自动生成索引文件** - 扫描所有 `.d.ts` 文件并生成统一的引用索引
2. **结构完整性检查** - 验证必需的类型文件是否存在
3. **语法正确性检查** - 使用 vue-tsc 进行类型语法验证

### 使用示例

```bash
# 执行完整的类型管理流程
node scripts/type-manager.js
```

### 预期输出

#### ✅ 成功情况
```
🚀 开始类型管理任务...

✅ 类型文件结构完整
✅ 类型索引文件已生成
📁 包含 5 个类型声明文件
✅ 类型语法检查通过

📊 类型管理任务完成
   结构检查: ✅
   语法检查: ✅
```

#### ❌ 失败情况
```
🚀 开始类型管理任务...

⚠️ 缺少类型文件:
   - env.d.ts
   - modules/form.d.ts
❌ 类型语法检查失败

📊 类型管理任务完成
   结构检查: ❌
   语法检查: ❌
```

### 生成的 index.d.ts 示例

```typescript
// 自动生成的类型索引文件
// 请勿手动编辑
// 生成时间: 2025-05-31T10:30:00.000Z

/// <reference path="./global.d.ts" />
/// <reference path="./env.d.ts" />
/// <reference path="./unocss.d.ts" />
/// <reference path="./modules/form.d.ts" />
/// <reference path="./modules/menu.d.ts" />

export {}
```

## 🔍 type-validator.js 详细说明

### 主要功能

1. **命名空间一致性验证** - 确保模块文件正确使用对应的命名空间
2. **引用关系检查** - 验证索引文件中的所有引用都指向有效文件
3. **问题诊断和建议** - 提供具体的修复指导

### 使用示例

```bash
# 执行类型一致性验证
node scripts/type-validator.js
```

### 预期输出

#### ✅ 验证通过
```
🔍 开始类型验证...

📋 检测到命名空间: Form, Menu, User
✅ form.d.ts 正确使用了 Form 命名空间
✅ menu.d.ts 正确使用了 Menu 命名空间
✅ user.d.ts 正确使用了 User 命名空间

📋 检测到 5 个类型引用
✅ 引用文件存在: ./global.d.ts
✅ 引用文件存在: ./env.d.ts
✅ 引用文件存在: ./modules/form.d.ts
✅ 引用文件存在: ./modules/menu.d.ts
✅ 引用文件存在: ./modules/user.d.ts

📊 验证结果:
   命名空间: ✅ 通过
   引用关系: ✅ 通过
   总体结果: ✅ 通过
```

#### ❌ 验证失败
```
🔍 开始类型验证...

📋 检测到命名空间: Form, Menu
⚠️ form.d.ts 应该使用 Form 命名空间
✅ menu.d.ts 正确使用了 Menu 命名空间

📋 检测到 4 个类型引用
✅ 引用文件存在: ./global.d.ts
❌ 引用的文件不存在: ./modules/user.d.ts
✅ 引用文件存在: ./modules/form.d.ts

📊 验证结果:
   命名空间: ❌ 失败
   引用关系: ❌ 失败
   总体结果: ❌ 失败

💡 建议:
   - 检查模块文件是否正确使用了对应的命名空间
   - 确保 global.d.ts 中定义了所需的命名空间
   - 检查 index.d.ts 中的引用路径是否正确
   - 确保所有被引用的类型文件都存在
```

## 📝 实际使用场景

### 场景 1: 新项目初始化
```bash
# 1. 创建基本的类型文件结构
mkdir -p src/types/modules

# 2. 创建必需的类型文件
touch src/types/{global,env,unocss}.d.ts
touch src/types/modules/{form,menu}.d.ts

# 3. 生成索引文件
npm run type:generate
```

### 场景 2: 开发过程中的类型检查
```bash
# 在 Git pre-commit hook 中
npm run type:check
```

### 场景 3: CI/CD 流水线中的质量检查
```yaml
# .github/workflows/ci.yml
- name: Type Check
  run: |
    npm run type:generate
    npm run type:validate
```

### 场景 4: 重构大型项目的类型系统
```bash
# 1. 首先验证当前状态
npm run type:validate

# 2. 根据输出的建议修复问题
# 3. 重新生成索引文件
npm run type:generate

# 4. 再次验证
npm run type:validate
```

## 🎯 类型文件示例

### global.d.ts
```typescript
// 全局命名空间定义
declare namespace Form {
  interface BaseField {
    name: string
    label: string
    required?: boolean
  }
  
  interface InputField extends BaseField {
    type: 'input'
    placeholder?: string
  }
}

declare namespace Menu {
  interface MenuItem {
    id: string
    title: string
    icon?: string
    children?: MenuItem[]
  }
}
```

### modules/form.d.ts
```typescript
// 使用全局命名空间扩展表单类型
declare namespace Form {
  interface SelectField extends BaseField {
    type: 'select'
    options: Array<{
      label: string
      value: string | number
    }>
  }
  
  type Field = InputField | SelectField
}
```

### modules/menu.d.ts
```typescript
// 使用全局命名空间扩展菜单类型
declare namespace Menu {
  interface MenuConfig {
    items: MenuItem[]
    collapsed?: boolean
    theme?: 'light' | 'dark'
  }
  
  type MenuEventType = 'click' | 'hover' | 'expand'
}
```

## 🛠️ 高级用法

### 作为模块导入使用
```typescript
import { 
  generateTypeIndex, 
  validateTypeStructure,
  checkTypeSyntax 
} from './scripts/type-manager.js'

import { validateTypes } from './scripts/type-validator.js'

// 在自定义构建脚本中使用
async function buildProcess() {
  console.log('开始构建...')
  
  // 检查类型文件结构
  if (!validateTypeStructure()) {
    throw new Error('类型文件结构不完整')
  }
  
  // 生成类型索引
  generateTypeIndex()
  
  // 验证类型一致性
  if (!validateTypes()) {
    throw new Error('类型验证失败')
  }
  
  console.log('类型检查通过，继续构建...')
}
```

### 集成到 Webpack/Vite 构建流程
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { validateTypes } from './scripts/type-validator.js'

export default defineConfig({
  // ...
  plugins: [
    {
      name: 'type-validation',
      buildStart() {
        if (!validateTypes()) {
          throw new Error('类型验证失败，请修复类型错误后重新构建')
        }
      }
    }
  ]
})
```

## 🔧 故障排除

### 常见问题

1. **"global.d.ts 文件不存在"**
   - 确保在 `src/types/` 目录下创建了 `global.d.ts` 文件

2. **"引用的文件不存在"**
   - 检查 `index.d.ts` 中的引用路径是否正确
   - 确保所有被引用的文件都存在

3. **"应该使用 XXX 命名空间"**
   - 在 `global.d.ts` 中定义对应的命名空间
   - 在模块文件中正确使用命名空间语法

4. **"vue-tsc 命令执行失败"**
   - 确保安装了 `vue-tsc` 依赖：`npm install --save-dev vue-tsc`
   - 检查 TypeScript 配置文件 `tsconfig.json` 是否正确

## 📈 最佳实践

1. **定期运行类型检查** - 在每次提交前运行完整的类型检查
2. **保持命名空间一致** - 模块文件名与命名空间名保持对应关系
3. **及时更新索引文件** - 添加新的类型文件后立即重新生成索引
4. **合理组织类型文件** - 将相关的类型定义放在同一个命名空间中
5. **使用 CI/CD 集成** - 在持续集成流程中加入类型验证步骤

---

通过这套工具，你可以轻松管理复杂 TypeScript 项目中的类型定义，确保类型系统的一致性和可维护性。