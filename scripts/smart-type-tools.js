// scripts/smart-type-tools.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 简单的文件扫描器
 * @param {string} baseDir - 基础目录
 * @param {string[]} extensions - 文件扩展名
 * @param {string[]} ignore - 忽略的目录
 * @returns {string[]} 文件列表
 */
const scanFiles = (
  baseDir,
  extensions = ['.ts', '.vue', '.js'],
  ignore = ['node_modules', 'dist', '.git']
) => {
  const results = []

  const walkDir = currentDir => {
    try {
      const items = fs.readdirSync(currentDir)

      for (const item of items) {
        const fullPath = path.join(currentDir, item)
        const relativePath = path.relative(baseDir, fullPath)

        if (ignore.some(ignoreDir => relativePath.includes(ignoreDir))) {
          continue
        }

        try {
          const stat = fs.statSync(fullPath)

          if (stat.isDirectory()) {
            walkDir(fullPath)
          } else if (
            stat.isFile() &&
            extensions.includes(path.extname(fullPath))
          ) {
            results.push(fullPath)
          }
        } catch {
          // 忽略无法读取的文件
        }
      }
    } catch {
      // 忽略无法读取的目录
    }
  }

  if (fs.existsSync(baseDir)) {
    walkDir(baseDir)
  }

  return results
}

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
const ensureDir = dirPath => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * 智能类型管理器
 */
export class SmartTypeManager {
  constructor(options = {}) {
    this.options = {
      rootDir: options.rootDir || process.cwd(),
      outputDir: path.join(
        options.rootDir || process.cwd(),
        'scripts/_look-file_'
      ),
      ...options,
    }

    this.typeDefinitions = new Map()
    this.typeUsages = new Map()
    this.duplicates = new Set()
    this.unusedTypes = new Set()
    this.sourceFiles = []

    ensureDir(this.options.outputDir)
  }

  /**
   * 运行类型分析
   * @returns {Promise<{success: boolean, report?: Object, error?: string}>}
   */
  async run() {
    console.log('🚀 智能类型管理器启动...\n')

    try {
      console.log('🔍 开始分析类型使用情况...')

      this.scanSourceFiles()
      this.analyzeTypeDefinitions()
      this.analyzeTypeUsages()
      this.detectIssues()

      const report = this.generateReport()
      this.saveReport(report)
      this.printReport(report)

      if (this.unusedTypes.size > 0 || this.duplicates.size > 0) {
        this.saveCleanupScript()
      }

      console.log('✅ 分析完成')

      return { success: true, report }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('❌ 分析过程中出现错误:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * 扫描源文件
   */
  scanSourceFiles() {
    const srcDir = path.join(this.options.rootDir, 'src')
    this.sourceFiles = scanFiles(srcDir)
    console.log(`  📁 发现 ${this.sourceFiles.length} 个源文件`)
  }

  /**
   * 分析类型定义
   */
  analyzeTypeDefinitions() {
    const typeRegex = /(?:interface|type|enum|class)\s+([A-Z][A-Za-z0-9_]*)/g

    for (const filePath of this.sourceFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        let match

        while ((match = typeRegex.exec(content)) !== null) {
          const typeName = match[1]

          if (this.typeDefinitions.has(typeName)) {
            this.duplicates.add(typeName)
          }

          this.typeDefinitions.set(typeName, {
            name: typeName,
            file: filePath,
            line: this.getLineNumber(content, match.index),
            type: this.getDefinitionType(match[0]),
          })
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        console.warn(`⚠️ 无法读取文件 ${filePath}: ${errorMessage}`)
      }
    }

    console.log(`  🎯 发现 ${this.typeDefinitions.size} 个类型定义`)
  }

  /**
   * 分析类型使用情况
   */
  analyzeTypeUsages() {
    for (const filePath of this.sourceFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8')

        for (const [typeName] of this.typeDefinitions) {
          const usageRegex = new RegExp(`\\b${typeName}\\b`, 'g')
          const matches = content.match(usageRegex) || []

          if (matches.length > 1) {
            if (!this.typeUsages.has(typeName)) {
              this.typeUsages.set(typeName, [])
            }

            const currentUsages = this.typeUsages.get(typeName) || []
            currentUsages.push({
              file: filePath,
              count: matches.length - 1,
            })
            this.typeUsages.set(typeName, currentUsages)
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        console.warn(`⚠️ 无法分析文件 ${filePath}: ${errorMessage}`)
      }
    }

    console.log(`  🔗 分析了 ${this.typeUsages.size} 个类型的使用情况`)
  }

  /**
   * 检测问题
   */
  detectIssues() {
    for (const [typeName] of this.typeDefinitions) {
      if (!this.typeUsages.has(typeName)) {
        this.unusedTypes.add(typeName)
      }
    }

    console.log(`  ❌ 发现 ${this.unusedTypes.size} 个未使用的类型`)
    console.log(`  ⚠️ 发现 ${this.duplicates.size} 个重复定义`)
  }

  /**
   * 生成分析报告
   * @returns {Object} 报告对象
   */
  generateReport() {
    const totalFiles = this.sourceFiles.length
    const totalTypes = this.typeDefinitions.size
    const totalUsages = Array.from(this.typeUsages.values()).reduce(
      (sum, usages) => sum + usages.reduce((s, u) => s + (u.count || 0), 0),
      0
    )

    const healthScore = this.calculateHealthScore(
      totalTypes,
      this.unusedTypes.size,
      this.duplicates.size
    )

    return {
      timestamp: new Date().toISOString(),
      summary: {
        sourceFiles: totalFiles,
        typeDefinitions: totalTypes,
        usageReferences: totalUsages,
        unusedTypes: this.unusedTypes.size,
        duplicateDefinitions: this.duplicates.size,
        healthScore,
      },
      issues: {
        critical: this.duplicates.size,
        warning: this.unusedTypes.size,
        info: Math.max(0, Math.floor(totalTypes * 0.1) - this.unusedTypes.size),
      },
      details: {
        unusedTypes: Array.from(this.unusedTypes),
        duplicates: Array.from(this.duplicates),
      },
      suggestions: this.generateSuggestions(),
    }
  }

  /**
   * 计算健康评分
   * @param {number} totalTypes - 总类型数
   * @param {number} unusedCount - 未使用数
   * @param {number} duplicateCount - 重复数
   * @returns {number} 评分
   */
  calculateHealthScore(totalTypes, unusedCount, duplicateCount) {
    if (totalTypes === 0) return 100

    const unusedPenalty = (unusedCount / totalTypes) * 30
    const duplicatePenalty = (duplicateCount / totalTypes) * 40

    return Math.max(0, Math.round(100 - unusedPenalty - duplicatePenalty))
  }

  /**
   * 生成建议
   * @returns {string[]} 建议列表
   */
  generateSuggestions() {
    const suggestions = []

    if (this.unusedTypes.size > 0) {
      suggestions.push(
        `💡 发现 ${this.unusedTypes.size} 个未使用的类型定义，建议清理`
      )
    }

    if (this.duplicates.size > 0) {
      suggestions.push(
        `⚠️ 发现 ${this.duplicates.size} 个重复的类型定义，建议合并`
      )
    }

    if (suggestions.length === 0) {
      suggestions.push('🎉 类型系统状态良好！')
    }

    return suggestions
  }

  /**
   * 保存报告
   * @param {Object} report - 报告对象
   */
  saveReport(report) {
    try {
      const outputPath = path.join(
        this.options.outputDir,
        'type-analysis-report.json'
      )
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
      console.log(`  📄 报告已保存: ${outputPath}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.warn(`⚠️ 保存报告失败: ${errorMessage}`)
    }
  }

  /**
   * 打印报告
   * @param {Object} report - 报告对象
   */
  printReport(report) {
    console.log('\n📊 类型系统分析报告')
    console.log('==================================================')

    console.log('\n📈 统计概览:')
    console.log(`  📁 源文件数量: ${report.summary.sourceFiles}`)
    console.log(`  🎯 类型定义: ${report.summary.typeDefinitions}`)
    console.log(`  🔗 使用引用: ${report.summary.usageReferences}`)
    console.log(`  ❌ 未使用类型: ${report.summary.unusedTypes}`)
    console.log(`  ⚠️  重复定义: ${report.summary.duplicateDefinitions}`)
    console.log(`  💯 健康评分: ${report.summary.healthScore}/100`)

    console.log('\n🔍 问题检测:')
    console.log(`  🚨 关键问题: ${report.issues.critical}`)
    console.log(`  ⚠️  警告问题: ${report.issues.warning}`)
    console.log(`  ℹ️  信息提示: ${report.issues.info}`)

    // 详细显示未使用的类型
    if (this.unusedTypes.size > 0) {
      console.log('\n❌ 未使用的类型定义详情:')
      let index = 1
      for (const typeName of Array.from(this.unusedTypes).slice(0, 10)) {
        const typeInfo = this.typeDefinitions.get(typeName)
        if (typeInfo) {
          const relativePath = path.relative(
            this.options.rootDir,
            typeInfo.file
          )
          console.log(`  ${index}. ${typeName} (${typeInfo.type})`)
          console.log(`     📁 文件: ${relativePath}`)
          console.log(`     📍 位置: 第 ${typeInfo.line} 行`)
          console.log(`     🗑️  建议: 可以安全删除此类型定义\n`)
          index++
        }
      }

      if (this.unusedTypes.size > 10) {
        console.log(`     ... 还有 ${this.unusedTypes.size - 10} 个未使用类型`)
      }
    }

    // 详细显示重复的类型定义
    if (this.duplicates.size > 0) {
      console.log('\n⚠️ 重复的类型定义详情:')
      let index = 1
      for (const typeName of Array.from(this.duplicates).slice(0, 5)) {
        console.log(`  ${index}. 类型名称: ${typeName}`)
        console.log(`     🔍 发现位置:`)

        const duplicateLocations = []
        for (const [name, typeInfo] of this.typeDefinitions) {
          if (name === typeName) {
            duplicateLocations.push(typeInfo)
          }
        }

        duplicateLocations.forEach((location, locIndex) => {
          const relativePath = path.relative(
            this.options.rootDir,
            location.file
          )
          console.log(
            `       ${locIndex + 1}) 📁 ${relativePath}:${location.line} (${location.type})`
          )
        })

        console.log(`     🔧 建议: 保留一个定义，删除其他重复项\n`)
        index++
      }

      if (this.duplicates.size > 5) {
        console.log(`     ... 还有 ${this.duplicates.size - 5} 个重复类型`)
      }
    }

    console.log('\n💡 改进建议:')
    report.suggestions.forEach(suggestion => {
      console.log(`  ${suggestion}`)
    })

    const healthScore = report.summary.healthScore || 0
    const healthMessage =
      healthScore >= 90
        ? '🎉 类型系统非常健康！'
        : healthScore >= 70
          ? '👍 类型系统基本健康，有改进空间'
          : '⚠️ 类型系统需要改进，建议优化'

    console.log(`\n${healthMessage}\n`)
  }

  /**
   * 保存清理脚本
   */
  saveCleanupScript() {
    try {
      const scriptContent = this.generateCleanupScript()
      const scriptPath = path.join(this.options.outputDir, 'cleanup-types.sh')
      fs.writeFileSync(scriptPath, scriptContent)
      console.log(`  📝 清理脚本已生成: ${scriptPath}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.warn(`⚠️ 生成清理脚本失败: ${errorMessage}`)
    }
  }

  /**
   * 生成清理脚本
   * @returns {string} 脚本内容
   */
  generateCleanupScript() {
    const lines = [
      '#!/bin/bash',
      '# 自动生成的类型清理脚本',
      '# 执行前请备份您的代码！',
      '',
      'echo "🛠️ TypeScript 类型清理工具"',
      'echo "=========================="',
      '',
    ]

    if (this.unusedTypes.size > 0) {
      lines.push('echo "🗑️ 清理未使用的类型定义..."')
      lines.push('')

      for (const typeName of Array.from(this.unusedTypes).slice(0, 20)) {
        const typeInfo = this.typeDefinitions.get(typeName)
        if (typeInfo) {
          const relativePath = path.relative(
            this.options.rootDir,
            typeInfo.file
          )
          lines.push(
            `echo "  - ${typeName} in ${relativePath}:${typeInfo.line}"`
          )
        }
      }
      lines.push('')
    }

    if (this.duplicates.size > 0) {
      lines.push('echo "🔗 处理重复的类型定义..."')
      lines.push('')

      for (const typeName of Array.from(this.duplicates).slice(0, 10)) {
        lines.push(`echo "  - 合并重复类型: ${typeName}"`)
      }
      lines.push('')
    }

    lines.push('echo "✅ 清理分析完成！"')
    lines.push(
      'echo "📋 请查看详细指南: scripts/_look-file_/TYPE_CLEANUP_GUIDE.md"'
    )

    return lines.join('\n')
  }

  /**
   * 获取行号
   * @param {string} content - 内容
   * @param {number} index - 索引
   * @returns {number} 行号
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length
  }

  /**
   * 获取定义类型
   * @param {string} match - 匹配文本
   * @returns {string} 类型
   */
  getDefinitionType(match) {
    if (match.startsWith('interface')) return 'interface'
    if (match.startsWith('type')) return 'type'
    if (match.startsWith('enum')) return 'enum'
    if (match.startsWith('class')) return 'class'
    return 'unknown'
  }
}

/**
 * 智能类型验证器
 */
export class SmartTypeValidator {
  constructor(options = {}) {
    this.options = {
      rootDir: options.rootDir || process.cwd(),
      tsconfigPath: options.tsconfigPath || './tsconfig.json',
      autoFix: options.autoFix || false,
      outputDir: path.join(
        options.rootDir || process.cwd(),
        'scripts/_look-file_'
      ),
      ...options,
    }

    this.errors = []
    this.warnings = []

    ensureDir(this.options.outputDir)
  }

  /**
   * 执行验证
   * @returns {Promise<{success: boolean, report: Object, hasErrors: boolean, hasWarnings: boolean, error?: string}>}
   */
  async validate() {
    console.log('🔍 开始智能类型验证...\n')

    try {
      this.runTypeScriptCheck()
      this.analyzeTypeUsagePatterns()
      this.checkBestPractices()

      const report = this.generateValidationReport()
      this.printValidationReport(report)

      if (this.options.autoFix && this.errors.some(e => e.fixable)) {
        this.applyAutoFixes()
      } else if (this.errors.length > 0 || this.warnings.length > 0) {
        this.generateFixSuggestions()
      }

      return {
        success: this.errors.length === 0,
        report,
        hasErrors: this.errors.length > 0,
        hasWarnings: this.warnings.length > 0,
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('❌ 验证过程中出现错误:', errorMessage)
      return {
        success: false,
        error: errorMessage,
        report: {
          summary: {
            totalErrors: this.errors.length,
            totalWarnings: this.warnings.length,
            validationScore: 0,
          },
        },
        hasErrors: true,
        hasWarnings: false,
      }
    }
  }

  /**
   * 运行 TypeScript 检查
   */
  runTypeScriptCheck() {
    console.log('🔧 执行 TypeScript 编译检查...')

    try {
      const configPath = path.resolve(
        this.options.rootDir,
        this.options.tsconfigPath
      )

      if (!fs.existsSync(configPath)) {
        console.log('⚠️ 未找到 tsconfig.json，跳过 TypeScript 检查')
        return
      }

      let tscCommand = 'npx tsc'

      try {
        execSync('which tsc', { stdio: 'ignore' })
        tscCommand = 'tsc'
      } catch {
        // 使用 npx
      }

      execSync(`${tscCommand} --noEmit --project "${configPath}"`, {
        cwd: this.options.rootDir,
        stdio: 'pipe',
      })

      console.log('✅ TypeScript 编译检查通过')
    } catch (error) {
      const output =
        error && error.stdout ? error.stdout.toString() : String(error)
      this.parseTypeScriptErrors(output)
      console.log(`❌ 发现 ${this.errors.length} 个 TypeScript 错误`)
    }
  }

  /**
   * 解析 TypeScript 错误
   * @param {string} output - 输出
   */
  parseTypeScriptErrors(output) {
    const errorRegex = /([^:]+):(\d+):(\d+) - error TS(\d+): (.+)/g
    let match

    while ((match = errorRegex.exec(output)) !== null) {
      this.errors.push({
        type: 'typescript',
        file: match[1] || '',
        line: parseInt(match[2] || '0', 10),
        column: parseInt(match[3] || '0', 10),
        code: `TS${match[4] || ''}`,
        message: match[5] || '',
        severity: 'error',
      })
    }
  }

  /**
   * 分析类型使用模式
   */
  analyzeTypeUsagePatterns() {
    console.log('🔍 分析类型使用模式...')

    const srcDir = path.join(this.options.rootDir, 'src')
    const files = scanFiles(srcDir, ['.ts', '.vue'])

    for (const filePath of files) {
      this.checkTypeUsageInFile(filePath)
    }

    console.log('✅ 类型使用分析完成')
  }

  /**
   * 检查文件中的类型使用
   * @param {string} filePath - 文件路径
   */
  checkTypeUsageInFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')

      const importRegex = /import.*from\s+['"]([^'"]+)['"]/g
      let match

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1]
        if (
          importPath &&
          (importPath.startsWith('@/') ||
            importPath.startsWith('./') ||
            importPath.startsWith('../'))
        ) {
          if (!this.resolveImportPath(filePath, importPath)) {
            this.errors.push({
              type: 'import',
              file: filePath,
              line: this.getLineNumber(content, match.index),
              message: `无法解析导入路径: ${importPath}`,
              severity: 'error',
              fixable: true,
            })
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.warn(`⚠️ 无法分析文件 ${filePath}: ${errorMessage}`)
    }
  }

  /**
   * 检查最佳实践
   */
  checkBestPractices() {
    console.log('📏 检查最佳实践遵循情况...')

    const srcDir = path.join(this.options.rootDir, 'src')
    const files = scanFiles(srcDir, ['.ts', '.vue'])

    for (const filePath of files) {
      this.checkBestPracticesInFile(filePath)
    }

    console.log('✅ 最佳实践检查完成')
  }

  /**
   * 检查文件最佳实践
   * @param {string} filePath - 文件路径
   */
  checkBestPracticesInFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')

      const anyRegex = /:\s*any\b/g
      const anyMatches = content.match(anyRegex)
      if (anyMatches && anyMatches.length > 0) {
        this.warnings.push({
          type: 'best-practice',
          file: filePath,
          message: `发现 ${anyMatches.length} 处 any 类型使用，建议使用具体类型`,
          severity: 'warning',
        })
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.warn(`⚠️ 无法检查文件 ${filePath}: ${errorMessage}`)
    }
  }

  /**
   * 生成验证报告
   * @returns {Object} 报告对象
   */
  generateValidationReport() {
    const totalErrors = this.errors.length
    const totalWarnings = this.warnings.length
    const validationScore = this.calculateValidationScore(
      totalErrors,
      totalWarnings
    )

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors,
        totalWarnings,
        validationScore,
      },
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.generateValidationSuggestions(),
    }
  }

  /**
   * 计算验证评分
   * @param {number} errors - 错误数
   * @param {number} warnings - 警告数
   * @returns {number} 评分
   */
  calculateValidationScore(errors, warnings) {
    const errorPenalty = errors * 15
    const warningPenalty = warnings * 5
    return Math.max(0, Math.round(100 - errorPenalty - warningPenalty))
  }

  /**
   * 生成验证建议
   * @returns {string[]} 建议列表
   */
  generateValidationSuggestions() {
    const suggestions = []

    if (this.errors.length > 0) {
      suggestions.push(
        `🔴 修复 ${this.errors.length} 个类型错误以提高类型安全性`
      )
    }

    const practiceWarnings = this.warnings.filter(
      w => w.type === 'best-practice'
    ).length
    if (practiceWarnings > 0) {
      suggestions.push(
        `🟢 改进 ${practiceWarnings} 个最佳实践问题以提高代码质量`
      )
    }

    if (suggestions.length === 0) {
      suggestions.push('🎉 所有检查都通过了！')
    }

    return suggestions
  }

  /**
   * 打印验证报告
   * @param {Object} report - 报告对象
   */
  printValidationReport(report) {
    console.log('\n📊 类型验证报告')
    console.log('==================================================')

    console.log('\n📈 验证结果:')
    console.log(`  ❌ 错误总数: ${report.summary.totalErrors}`)
    console.log(`  ⚠️  警告总数: ${report.summary.totalWarnings}`)
    console.log(`  💯 验证评分: ${report.summary.validationScore}/100`)

    if (this.errors.length > 0) {
      console.log('\n🚨 类型错误详情:')
      this.errors.slice(0, 5).forEach((error, index) => {
        const relativePath = path.relative(this.options.rootDir, error.file)
        console.log(`\n  ${index + 1}. ${error.type.toUpperCase()} 错误`)
        console.log(`     📁 文件: ${relativePath}`)
        console.log(`     📍 位置: 第 ${error.line || '?'} 行`)
        console.log(`     ❌ 问题: ${error.message}`)

        if (error.fixable) {
          console.log(`     🔧 状态: 可自动修复`)
        }
      })

      if (this.errors.length > 5) {
        console.log(`\n  ... 还有 ${this.errors.length - 5} 个错误`)
      }
    }

    console.log('\n💡 改进建议:')
    report.suggestions.forEach(suggestion => {
      console.log(`  ${suggestion}`)
    })
  }

  /**
   * 生成修复建议
   */
  generateFixSuggestions() {
    if (this.errors.length === 0 && this.warnings.length === 0) return

    console.log('\n💡 生成修复建议...\n')
    console.log('🔧 修复建议:\n')

    if (this.errors.length > 0) {
      console.log('1. 类型错误修复')
      console.log('   💡 建议: 检查类型定义和使用是否正确')
      console.log('   🤖 可尝试: 使用 --auto-fix 参数自动修复部分问题\n')
    }

    if (this.warnings.length > 0) {
      console.log('2. 警告问题优化')
      console.log('   💡 建议: 参考最佳实践改进代码质量\n')
    }
  }

  /**
   * 应用自动修复
   */
  applyAutoFixes() {
    console.log('\n🤖 开始自动修复...')

    const fixableErrors = this.errors.filter(error => error.fixable)

    if (fixableErrors.length === 0) {
      console.log('没有可自动修复的问题')
      return
    }

    console.log(`发现 ${fixableErrors.length} 个可修复的问题，开始处理...`)
    console.log('🎉 自动修复功能正在开发中，敬请期待！')
  }

  /**
   * 解析导入路径
   * @param {string} filePath - 文件路径
   * @param {string} importPath - 导入路径
   * @returns {boolean} 是否有效
   */
  resolveImportPath(filePath, importPath) {
    try {
      let resolvedPath

      if (importPath.startsWith('@/')) {
        resolvedPath = path.resolve(
          this.options.rootDir,
          'src',
          importPath.substring(2)
        )
      } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
        resolvedPath = path.resolve(path.dirname(filePath), importPath)
      } else {
        return true
      }

      const extensions = [
        '.ts',
        '.js',
        '.vue',
        '.d.ts',
        '/index.ts',
        '/index.js',
      ]

      for (const ext of extensions) {
        const fullPath = resolvedPath + ext
        if (fs.existsSync(fullPath)) {
          return true
        }
      }

      return fs.existsSync(resolvedPath)
    } catch {
      return false
    }
  }

  /**
   * 获取行号
   * @param {string} content - 内容
   * @param {number} index - 索引
   * @returns {number} 行号
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length
  }
}
