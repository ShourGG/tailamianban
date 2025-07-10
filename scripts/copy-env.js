#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

/**
 * Robot Admin 环境文件自动复制脚本 (Bun 优先 + npm 兼容版本)
 * 基于项目实际的启动命令和环境文件配置
 *
 * 使用方法：
 * - bun run env:dev        (开发环境 - 对应 bun run dev)
 * - bun run env:test       (测试环境 - 对应 bun run build:test)
 * - bun run env:staging    (预发布环境 - 对应 bun run build:staging)
 * - bun run env:prod       (生产环境 - 对应 bun run build)
 *
 * 也支持 npm：
 * - npm run env:dev        (开发环境)
 * - npm run env:test       (测试环境)
 * - npm run env:staging    (预发布环境)
 * - npm run env:prod       (生产环境)
 */

// ES6 Module 中获取 __dirname 的方法
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 检测当前运行时环境
const isBun = typeof Bun !== 'undefined'
const isNode =
  !isBun && typeof process !== 'undefined' && process.versions?.node

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}

const log = {
  error: msg => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  success: msg => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: msg => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: msg => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  step: msg => console.log(`${colors.cyan}🔧 ${msg}${colors.reset}`),
  runtime: msg => console.log(`${colors.magenta}🚀 ${msg}${colors.reset}`),
}

// 获取命令行参数
const env = process.argv[2]

// 环境映射配置 - 基于你的实际文件名
const envMap = {
  // 开发环境
  dev: '.env.development',
  development: '.env.development',

  // 测试环境
  test: '.env.test',

  // 预发布环境
  stage: '.env.staging',
  staging: '.env.staging',

  // 生产环境
  prod: '.env.production',
  production: '.env.production',

  // 默认环境
  default: '.env',
}

// 根据运行时环境生成构建命令
function getBuildCommands() {
  const runtime = isBun ? 'bun run' : 'npm run'

  return {
    dev: `${runtime} dev`,
    development: `${runtime} dev`,
    test: `${runtime} build:test`,
    stage: `${runtime} build:staging`,
    staging: `${runtime} build:staging`,
    prod: `${runtime} build`,
    production: `${runtime} build`,
  }
}

// 路径配置
const rootDir = path.resolve(__dirname, '..')
const envsDir = path.join(rootDir, 'envs')
const targetEnvFile = path.join(rootDir, '.env')

/**
 * 检测包管理器和运行时环境
 */
function detectEnvironment() {
  const packageJsonPath = path.join(rootDir, 'package.json')
  let packageManager = 'unknown'
  let lockFileExists = false

  // 检测包管理器
  if (fs.existsSync(path.join(rootDir, 'bun.lockb'))) {
    packageManager = 'bun'
    lockFileExists = true
  } else if (fs.existsSync(path.join(rootDir, 'bun.lock'))) {
    packageManager = 'bun'
    lockFileExists = true
  } else if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) {
    packageManager = 'npm'
    lockFileExists = true
  } else if (fs.existsSync(path.join(rootDir, 'yarn.lock'))) {
    packageManager = 'yarn'
    lockFileExists = true
  } else if (fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm'
    lockFileExists = true
  }

  // 读取 package.json 获取项目信息
  let projectName = 'unknown'
  let hasScripts = false

  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      projectName = packageJson.name || 'unknown'
      hasScripts =
        packageJson.scripts && Object.keys(packageJson.scripts).length > 0
    } catch  {
      // ignore
    }
  }

  return {
    runtime: isBun ? 'Bun' : isNode ? 'Node.js' : 'Unknown',
    version: isBun ? Bun.version : process.version,
    packageManager,
    lockFileExists,
    projectName,
    hasScripts,
  }
}

/**
 * 检查系统环境和权限
 */
function checkSystemEnvironment() {
  const envInfo = detectEnvironment()
  const checks = []

  // 检查运行时环境
  checks.push({
    name: '运行时环境',
    status: true,
    detail: `${envInfo.runtime} ${envInfo.version}`,
  })

  // 检查包管理器 (警告但不阻止构建)
  if (envInfo.lockFileExists) {
    checks.push({
      name: '包管理器',
      status: true,
      detail: `${envInfo.packageManager} (检测到锁文件)`,
    })
  } else {
    // 包管理器检测失败时只警告，不阻止构建
    console.log(
      `${colors.yellow}⚠️  包管理器检测: ${envInfo.packageManager} (未检测到锁文件，但继续构建)${colors.reset}`
    )
  }

  // 检查项目信息
  checks.push({
    name: '项目信息',
    status: envInfo.projectName !== 'unknown',
    detail: `${envInfo.projectName}${envInfo.hasScripts ? ' (有构建脚本)' : ' (无构建脚本)'}`,
  })

  // 检查操作系统
  checks.push({
    name: '操作系统',
    status: true,
    detail: `${os.type()} ${os.release()}`,
  })

  // 检查工作目录
  const cwd = process.cwd()
  checks.push({
    name: '当前工作目录',
    status:
      cwd.includes('robot-admin') ||
      fs.existsSync(path.join(cwd, 'package.json')),
    detail: cwd,
  })

  // 检查 envs 目录
  checks.push({
    name: 'envs 目录',
    status: fs.existsSync(envsDir),
    detail: envsDir,
  })

  // 检查根目录写权限
  try {
    const testFile = path.join(rootDir, '.env-test-write')
    fs.writeFileSync(testFile, 'test')
    fs.unlinkSync(testFile)
    checks.push({
      name: '根目录写权限',
      status: true,
      detail: '可写',
    })
  } catch (error) {
    checks.push({
      name: '根目录写权限',
      status: false,
      detail: error.message,
    })
  }

  return { checks, envInfo }
}

/**
 * 扫描可用的环境文件
 */
function scanAvailableEnvFiles() {
  if (!fs.existsSync(envsDir)) {
    log.error(`envs 目录不存在: ${envsDir}`)
    return []
  }

  try {
    const files = fs
      .readdirSync(envsDir)
      .filter(file => file.startsWith('.env'))
      .sort()

    return files.map(file => {
      const filePath = path.join(envsDir, file)
      const stats = fs.statSync(filePath)

      return {
        name: file,
        path: filePath,
        size: stats.size,
        modified: stats.mtime.toLocaleString('zh-CN'),
        readable: fs.constants.R_OK,
      }
    })
  } catch (error) {
    log.error(`扫描 envs 目录失败: ${error.message}`)
    return []
  }
}

/**
 * 验证环境文件内容
 */
function validateEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    const variables = []
    const errors = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // 跳过空行和注释
      if (!trimmed || trimmed.startsWith('#')) return

      // 检查环境变量格式
      if (!trimmed.includes('=')) {
        errors.push(`第 ${index + 1} 行: 缺少等号 - "${trimmed}"`)
        return
      }

      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=')

      if (!key.trim()) {
        errors.push(`第 ${index + 1} 行: 变量名为空`)
        return
      }

      // 检查变量名格式 (允许字母、数字、下划线)
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key.trim())) {
        errors.push(`第 ${index + 1} 行: 变量名格式不正确 - "${key.trim()}"`)
        return
      }

      variables.push({
        key: key.trim(),
        value: value.trim(),
        line: index + 1,
      })
    })

    return {
      valid: errors.length === 0,
      variables,
      errors,
      lineCount: lines.length,
      variableCount: variables.length,
    }
  } catch (error) {
    return {
      valid: false,
      variables: [],
      errors: [`文件读取失败: ${error.message}`],
      lineCount: 0,
      variableCount: 0,
    }
  }
}

/**
 * 创建备份文件
 */
function createBackup(sourceFile) {
  if (!fs.existsSync(sourceFile)) {
    return null
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = `${sourceFile}.backup.${timestamp}`

  try {
    fs.copyFileSync(sourceFile, backupFile)
    return backupFile
  } catch (error) {
    throw new Error(`创建备份失败: ${error.message}`)
  }
}

/**
 * 复制环境文件
 */
async function copyEnvFile(envType) {
  const buildCommands = getBuildCommands()

  log.step(`开始处理 ${envType} 环境...`)

  // 1. 系统环境检查
  log.info('检查系统环境...')
  const { checks, envInfo } = checkSystemEnvironment()
  const failedChecks = checks.filter(check => !check.status)

  // 显示运行时信息
  log.runtime(`运行环境: ${envInfo.runtime} ${envInfo.version}`)
  log.runtime(
    `包管理器: ${envInfo.packageManager} (项目: ${envInfo.projectName})`
  )

  if (failedChecks.length > 0) {
    log.error('系统环境检查失败:')
    failedChecks.forEach(check => {
      console.log(`  • ${check.name}: ${check.detail}`)
    })
    process.exit(1)
  }

  // 2. 环境类型验证
  const sourceFileName = envMap[envType]
  if (!sourceFileName) {
    log.error(`不支持的环境类型: ${envType}`)
    log.info('支持的环境类型:')
    Object.keys(envMap).forEach(key => {
      const command = buildCommands[key] || '手动指定'
      console.log(
        `  • ${key.padEnd(12)} → ${envMap[key].padEnd(20)} (${command})`
      )
    })
    process.exit(1)
  }

  // 3. 扫描可用文件
  log.info('扫描可用的环境文件...')
  const availableFiles = scanAvailableEnvFiles()
  if (availableFiles.length === 0) {
    log.error('envs 目录中没有找到任何环境文件')
    log.info(`请在 ${envsDir} 目录中创建环境文件`)
    log.info('创建示例:')
    console.log(`  mkdir -p envs`)
    console.log(`  echo "NODE_ENV=development" > envs/.env.development`)
    console.log(`  echo "NODE_ENV=production" > envs/.env.production`)
    process.exit(1)
  }

  log.info(`找到 ${availableFiles.length} 个环境文件:`)
  availableFiles.forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(2)
    console.log(
      `  • ${file.name.padEnd(20)} (${sizeKB}KB, 修改于: ${file.modified})`
    )
  })

  // 4. 源文件检查
  const sourceFile = path.join(envsDir, sourceFileName)
  if (!fs.existsSync(sourceFile)) {
    log.error(`源文件不存在: ${sourceFile}`)
    log.info('可用的文件:')
    availableFiles.forEach(file => console.log(`  • ${file.name}`))
    process.exit(1)
  }

  // 5. 验证源文件内容
  log.step('验证环境文件内容...')
  const validation = validateEnvFile(sourceFile)
  if (!validation.valid) {
    log.error(`环境文件格式错误 (${sourceFile}):`)
    validation.errors.forEach(error => console.log(`  • ${error}`))
    process.exit(1)
  }

  log.success(
    `环境文件验证通过: ${validation.variableCount} 个变量，${validation.lineCount} 行`
  )

  // 6. 创建备份
  let backupFile = null
  if (fs.existsSync(targetEnvFile)) {
    try {
      log.step('备份现有环境文件...')
      backupFile = createBackup(targetEnvFile)
      log.success(`备份创建成功: ${path.basename(backupFile)}`)
    } catch (error) {
      log.error(error.message)
      process.exit(1)
    }
  }

  // 7. 执行复制
  try {
    log.step('复制环境文件...')
    fs.copyFileSync(sourceFile, targetEnvFile)

    // 验证复制结果
    const targetValidation = validateEnvFile(targetEnvFile)
    if (!targetValidation.valid) {
      log.error('复制后的文件验证失败!')
      if (backupFile) {
        fs.copyFileSync(backupFile, targetEnvFile)
        log.info('已恢复备份文件')
      }
      process.exit(1)
    }

    log.success(`成功切换到 ${envType} 环境`)
    log.info(`复制: ${sourceFileName} → .env`)

    // 8. 显示环境信息
    showEnvironmentInfo(envType, targetValidation, envInfo)
  } catch (error) {
    log.error(`复制失败: ${error.message}`)
    if (backupFile) {
      try {
        fs.copyFileSync(backupFile, targetEnvFile)
        log.info('已恢复备份文件')
      } catch (restoreError) {
        log.error(`恢复备份也失败了: ${restoreError.message}`)
      }
    }
    process.exit(1)
  }
}

/**
 * 显示环境信息
 */
function showEnvironmentInfo(envType, validation, envInfo) {
  const buildCommands = getBuildCommands()

  console.log('\n' + '='.repeat(60))
  console.log(`🎯 ${envType.toUpperCase()} 环境已激活 (${envInfo.runtime})`)
  console.log('='.repeat(60))

  // 显示构建命令
  const buildCommand = buildCommands[envType]
  if (buildCommand) {
    log.info(`推荐命令: ${buildCommand}`)
  }

  // 显示运行时特定的建议
  if (isBun) {
    log.info(`Bun 特性: 快速启动、TypeScript 原生支持`)
  } else {
    log.info(`Node.js 环境: 稳定可靠、生态丰富`)
  }

  // 显示关键环境变量（隐藏敏感信息）
  console.log('\n📋 关键环境变量:')
  const importantVars = validation.variables
    .filter(
      v =>
        v.key.includes('API') ||
        v.key.includes('URL') ||
        v.key.includes('MODE') ||
        v.key.includes('ENV') ||
        v.key.includes('BASE') ||
        v.key.includes('PORT')
    )
    .slice(0, 8)

  if (importantVars.length > 0) {
    importantVars.forEach(variable => {
      const maskedValue = maskSensitiveValue(variable.value)
      console.log(`  • ${variable.key.padEnd(25)} = ${maskedValue}`)
    })
  } else {
    console.log('  • 未找到关键环境变量')
  }

  if (validation.variableCount > importantVars.length) {
    console.log(
      `  • ... 还有 ${validation.variableCount - importantVars.length} 个其他变量`
    )
  }

  console.log('\n' + '='.repeat(60))
}

/**
 * 掩码敏感信息
 */
function maskSensitiveValue(value) {
  if (value.length <= 8) {
    return '*'.repeat(value.length)
  }

  const start = value.substring(0, 3)
  const end = value.substring(value.length - 3)
  const middle = '*'.repeat(Math.max(0, value.length - 6))

  return start + middle + end
}

/**
 * 显示帮助信息
 */
function showHelp() {
  const envInfo = detectEnvironment()
  const buildCommands = getBuildCommands()
  const runtime = isBun ? 'Bun' : 'Node.js'
  const packageManager = envInfo.packageManager === 'bun' ? 'bun' : 'npm'

  console.log(`
🤖 Robot Admin 环境管理工具 (${runtime} 运行时)

${colors.cyan}当前环境:${colors.reset}
  运行时: ${envInfo.runtime} ${envInfo.version}
  包管理器: ${envInfo.packageManager}
  项目: ${envInfo.projectName}

${colors.cyan}使用方法:${colors.reset}
  node scripts/copy-env.js <environment>
  bun scripts/copy-env.js <environment>

${colors.cyan}支持的环境:${colors.reset}
  dev, development    → 开发环境     (${buildCommands.dev})
  test               → 测试环境     (${buildCommands.test})
  stage, staging     → 预发布环境   (${buildCommands.stage})
  prod, production   → 生产环境     (${buildCommands.prod})

${colors.cyan}示例:${colors.reset}
  ${packageManager === 'bun' ? 'bun' : 'node'} scripts/copy-env.js dev
  ${packageManager === 'bun' ? 'bun' : 'node'} scripts/copy-env.js production

${colors.cyan}推荐的 ${packageManager} scripts (添加到 package.json):${colors.reset}
  "env:dev": "${packageManager === 'bun' ? 'bun' : 'node'} scripts/copy-env.js dev",
  "env:test": "${packageManager === 'bun' ? 'bun' : 'node'} scripts/copy-env.js test",
  "env:staging": "${packageManager === 'bun' ? 'bun' : 'node'} scripts/copy-env.js staging",
  "env:prod": "${packageManager === 'bun' ? 'bun' : 'node'} scripts/copy-env.js prod"

${colors.cyan}自动化工作流:${colors.reset}
  "dev": "${packageManager === 'bun' ? 'bun' : 'node'} scripts/copy-env.js dev && ${packageManager} run start:dev",
  "build:test": "${packageManager === 'bun' ? 'bun' : 'node'} scripts/copy-env.js test && ${packageManager} run build",
  "build:prod": "${packageManager === 'bun' ? 'bun' : 'node'} scripts/copy-env.js prod && ${packageManager} run build"

${colors.cyan}功能特性:${colors.reset}
  ✅ Bun + Node.js 双兼容  ✅ 自动检测运行环境
  ✅ 系统环境检查         ✅ 文件格式验证
  ✅ 自动备份恢复         ✅ 详细错误提示
  ✅ 敏感信息保护         ✅ 多环境支持
  ✅ ES6 Module 语法      ✅ 现代化代码风格
`)
}

/**
 * 扫描环境文件
 */
function scanEnvironmentFiles() {
  log.info('扫描环境文件...')
  const files = scanAvailableEnvFiles()
  const envInfo = detectEnvironment()

  log.runtime(`使用 ${envInfo.runtime} ${envInfo.version} 扫描`)

  if (files.length === 0) {
    log.warning('未找到任何环境文件')
    log.info('请在 envs/ 目录中创建环境文件:')
    console.log('  mkdir -p envs')
    console.log('  echo "NODE_ENV=development" > envs/.env.development')
    console.log('  echo "NODE_ENV=test" > envs/.env.test')
    console.log('  echo "NODE_ENV=production" > envs/.env.production')
  } else {
    console.log(`找到 ${files.length} 个环境文件:`)
    files.forEach(file => {
      console.log(`\n📄 ${file.name}`)
      console.log(`   大小: ${(file.size / 1024).toFixed(2)}KB`)
      console.log(`   修改: ${file.modified}`)

      const validation = validateEnvFile(file.path)
      if (validation.valid) {
        console.log(`   状态: ✅ 有效 (${validation.variableCount} 个变量)`)

        // 显示一些关键变量预览
        const keyVars = validation.variables
          .filter(
            v =>
              v.key.includes('NODE_ENV') ||
              v.key.includes('API') ||
              v.key.includes('URL')
          )
          .slice(0, 3)

        if (keyVars.length > 0) {
          keyVars.forEach(v => {
            console.log(
              `   ${colors.gray}   ${v.key} = ${maskSensitiveValue(v.value)}${colors.reset}`
            )
          })
        }
      } else {
        console.log(`   状态: ❌ 无效 (${validation.errors.length} 个错误)`)
        validation.errors.slice(0, 2).forEach(error => {
          console.log(`   ${colors.gray}   • ${error}${colors.reset}`)
        })
      }
    })
  }
}

/**
 * 主程序入口
 */
async function main() {
  // 帮助信息
  if (!env || env === '--help' || env === '-h') {
    showHelp()
    process.exit(0)
  }

  // 扫描命令
  if (env === '--scan' || env === 'scan') {
    scanEnvironmentFiles()
    process.exit(0)
  }

  // 执行环境切换
  await copyEnvFile(env)
}

// 启动主程序
main().catch(error => {
  log.error(`程序执行失败: ${error.message}`)
  console.error(error.stack)
  process.exit(1)
})
