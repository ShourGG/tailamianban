// scripts/type-detailed-report.js
import { SmartTypeManager, SmartTypeValidator } from './smart-type-tools.js'
import fs from 'fs'
import path from 'path'

/**
 * 生成详细的清理和修复指南
 */
const generateDetailedReport = async () => {
  console.log('📋 生成详细的类型问题报告...\n')

  try {
    const manager = new SmartTypeManager({ rootDir: process.cwd() })
    await manager.run()

    console.log('\n' + '='.repeat(60) + '\n')

    const validator = new SmartTypeValidator({ rootDir: process.cwd() })
    await validator.validate()

    generateCleanupGuide(manager, validator)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ 生成报告失败:', errorMessage)
    process.exit(1)
  }
}

/**
 * 生成清理指南
 * @param {SmartTypeManager} manager - 类型管理器
 * @param {SmartTypeValidator} validator - 类型验证器
 */
const generateCleanupGuide = (manager, validator) => {
  const guide = []
  const outputDir = path.join(process.cwd(), 'scripts/_look-file_')

  guide.push('# 🛠️ TypeScript 类型清理和修复指南')
  guide.push('')
  guide.push('> 自动生成于: ' + new Date().toLocaleString())
  guide.push('> 项目路径: ' + process.cwd())
  guide.push('')

  // 未使用的类型清理指南
  if (manager.unusedTypes.size > 0) {
    guide.push('## 🗑️ 未使用的类型定义清理')
    guide.push('')
    guide.push(`总计发现 ${manager.unusedTypes.size} 个未使用的类型定义：`)
    guide.push('')

    let index = 1
    for (const typeName of manager.unusedTypes) {
      const typeInfo = manager.typeDefinitions.get(typeName)
      if (typeInfo) {
        const relativePath = path.relative(process.cwd(), typeInfo.file)
        guide.push(`### ${index}. ${typeName}`)
        guide.push(`- **文件**: \`${relativePath}\``)
        guide.push(`- **位置**: 第 ${typeInfo.line} 行`)
        guide.push(`- **类型**: ${typeInfo.type}`)
        guide.push(`- **操作**: 删除整个类型定义`)
        guide.push('')

        guide.push('```bash')
        guide.push(`# 编辑文件 ${relativePath}`)
        guide.push(`# 删除第 ${typeInfo.line} 行附近的 ${typeName} 定义`)
        guide.push('```')
        guide.push('')
        index++
      }
    }
  }

  // 重复类型合并指南
  if (manager.duplicates.size > 0) {
    guide.push('## 🔗 重复类型定义合并')
    guide.push('')
    guide.push(`总计发现 ${manager.duplicates.size} 个重复的类型定义：`)
    guide.push('')

    let index = 1
    for (const typeName of manager.duplicates) {
      guide.push(`### ${index}. ${typeName}`)
      guide.push('')
      guide.push('**重复位置:**')

      const duplicateLocations = []
      for (const [name, typeInfo] of manager.typeDefinitions) {
        if (name === typeName) {
          duplicateLocations.push(typeInfo)
        }
      }

      duplicateLocations.forEach((location, locIndex) => {
        const relativePath = path.relative(process.cwd(), location.file)
        guide.push(
          `${locIndex + 1}. \`${relativePath}:${location.line}\` (${location.type})`
        )
      })

      guide.push('')
      guide.push('**建议操作:**')
      guide.push('1. 选择一个主要位置保留定义')
      guide.push('2. 删除其他位置的重复定义')
      guide.push('3. 更新所有导入引用')
      guide.push('')
      index++
    }
  }

  // 类型错误修复指南
  if (validator.errors.length > 0) {
    guide.push('## 🚨 类型错误修复')
    guide.push('')
    guide.push(`总计发现 ${validator.errors.length} 个类型错误：`)
    guide.push('')

    validator.errors.forEach((error, index) => {
      const relativePath = path.relative(process.cwd(), error.file)
      guide.push(`### ${index + 1}. ${error.type.toUpperCase()} 错误`)
      guide.push(`- **文件**: \`${relativePath}\``)
      guide.push(`- **位置**: 第 ${error.line || '?'} 行`)
      guide.push(`- **问题**: ${error.message}`)

      if (error.type === 'import') {
        guide.push('- **修复步骤**:')
        guide.push('  1. 检查目标文件是否存在')
        guide.push('  2. 确认路径大小写正确')
        guide.push('  3. 验证文件扩展名')
        guide.push('  4. 检查路径别名配置')
      }

      guide.push('')
    })
  }

  // 最佳实践改进
  if (validator.warnings.length > 0) {
    guide.push('## ⚠️ 最佳实践改进')
    guide.push('')
    guide.push(`总计发现 ${validator.warnings.length} 个警告问题：`)
    guide.push('')

    const warningsByType = {}
    validator.warnings.forEach(warning => {
      if (!warningsByType[warning.type]) {
        warningsByType[warning.type] = []
      }
      warningsByType[warning.type].push(warning)
    })

    Object.keys(warningsByType).forEach((type, typeIndex) => {
      const warnings = warningsByType[type]
      guide.push(
        `### ${typeIndex + 1}. ${type.replace('-', ' ').toUpperCase()} 问题 (${warnings.length} 个)`
      )
      guide.push('')

      if (type === 'best-practice') {
        guide.push('**主要问题**: 使用了 `any` 类型')
        guide.push('**影响**: 失去了 TypeScript 的类型安全保护')
        guide.push('**修复建议**:')
        guide.push('- 使用具体的接口或类型定义')
        guide.push('- 使用联合类型 `string | number`')
        guide.push('- 使用泛型 `<T>`')
        guide.push('- 使用 `unknown` 类型替代 `any`')
        guide.push('')

        guide.push('**问题文件**:')
        warnings.slice(0, 10).forEach((warning, index) => {
          const relativePath = path.relative(process.cwd(), warning.file)
          guide.push(`${index + 1}. \`${relativePath}\` - ${warning.message}`)
        })

        if (warnings.length > 10) {
          guide.push(`... 还有 ${warnings.length - 10} 个类似问题`)
        }
      }

      guide.push('')
    })
  }

  // 清理脚本生成
  guide.push('## 🚀 自动化清理脚本')
  guide.push('')
  guide.push('以下是可以自动执行的清理脚本：')
  guide.push('')

  guide.push('### 验证脚本')
  guide.push('')
  guide.push('```bash')
  guide.push('#!/bin/bash')
  guide.push('# 修复后验证脚本')
  guide.push('echo "🔍 运行类型检查..."')
  guide.push('bun run type:check')
  guide.push('')
  guide.push('echo "🔧 运行 TypeScript 编译检查..."')
  guide.push('npx tsc --noEmit')
  guide.push('')
  guide.push('echo "✅ 验证完成"')
  guide.push('```')
  guide.push('')

  // 优先级建议
  guide.push('## 🎯 修复优先级建议')
  guide.push('')
  guide.push('按照以下优先级进行修复：')
  guide.push('')
  guide.push('1. **🔴 高优先级**: TypeScript 编译错误')
  guide.push('   - 这些错误会阻止编译，必须优先修复')
  guide.push('   - 主要是导入路径错误和类型不匹配')
  guide.push('')
  guide.push('2. **🟠 中优先级**: 重复类型定义')
  guide.push('   - 可能导致类型冲突和维护困难')
  guide.push('   - 建议合并到统一位置')
  guide.push('')
  guide.push('3. **🟡 低优先级**: 未使用的类型定义')
  guide.push('   - 不影响功能，但会增加代码复杂度')
  guide.push('   - 可以逐步清理')
  guide.push('')
  guide.push('4. **🟢 改进建议**: any 类型使用')
  guide.push('   - 不影响编译，但降低类型安全性')
  guide.push('   - 可以在空闲时间改进')
  guide.push('')

  // 保存指南
  const guidePath = path.join(outputDir, 'TYPE_CLEANUP_GUIDE.md')

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    fs.writeFileSync(guidePath, guide.join('\n'))

    console.log('\n🎉 详细报告生成完成！')
    console.log(`📄 清理指南已保存: ${guidePath}`)
    console.log('\n🔍 查看指南:')
    console.log(`  cat "${guidePath}"`)
    console.log('\n📝 或在编辑器中打开:')
    console.log(`  code "${guidePath}"`)
    console.log('\n🚀 建议的执行顺序:')
    console.log('  1. 阅读完整的清理指南')
    console.log('  2. 备份当前代码')
    console.log('  3. 按优先级修复问题')
    console.log('  4. 运行 bun run type:check 验证')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ 保存指南失败: ${errorMessage}`)
  }
}

generateDetailedReport()
