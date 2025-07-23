#!/usr/bin/env node

import { execSync } from 'child_process'
import { argv } from 'process'

/**
 * Git 分支对比工具
 * 使用方法: bun scripts/check-branch.mjs <target-branch> [options]
 */

// 配置选项
const config = {
  maxCommitsToShow: 10,
  autoFetch: true,
  verbose: false,
  format: 'pretty', // pretty, json, minimal
}

// 解析命令行参数
function parseArgs() {
  const args = argv.slice(2)
  const options = {}
  const flags = []

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      options[key] = value || true
    } else if (arg.startsWith('-')) {
      flags.push(arg.slice(1))
    } else if (!options.target) {
      options.target = arg
    }
  })

  return { ...options, flags }
}

// 精致的颜色和样式工具
const styles = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
}

const icons = {
  success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️',
  branch: '🌿', compare: '🔍', file: '📄', plus: '✨',
  minus: '🗑️', equal: '🟰', chart: '📊', history: '📚',
  target: '🎯', clean: '🧹', dirty: '💭'
}

// 增强的日志工具
const log = {
  title: msg => console.log(`\n${styles.bold}${styles.cyan}╭─ ${msg} ─╮${styles.reset}`),
  subtitle: msg => console.log(`${styles.bold}${styles.blue}├─ ${msg}${styles.reset}`),
  success: msg => console.log(`${styles.green}${icons.success} ${msg}${styles.reset}`),
  warning: msg => console.log(`${styles.yellow}${icons.warning} ${msg}${styles.reset}`),
  error: msg => console.log(`${styles.red}${icons.error} ${msg}${styles.reset}`),
  info: msg => console.log(`${styles.blue}${icons.info} ${msg}${styles.reset}`),
  detail: msg => console.log(`${styles.gray}  │ ${msg}${styles.reset}`),
  separator: () => console.log(`${styles.gray}  ├${'─'.repeat(50)}${styles.reset}`),
  end: () => console.log(`${styles.cyan}╰${'─'.repeat(52)}╯${styles.reset}\n`),
}

/**
 * 安全执行 Git 命令
 */
function execGitCommand(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      timeout: options.timeout || 10000, // 10秒超时
      ...options,
    })
  } catch (error) {
    if (!options.silent) {
      log.error(`命令执行失败: ${command}`)
      log.detail(error.message)
    }
    return null
  }
}

/**
 * 检查是否在 Git 仓库中
 */
function checkIsGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' })
    return true
  } catch {
    log.error('当前目录不是 Git 仓库')
    process.exit(1)
  }
}

/**
 * 验证分支名安全性
 */
function validateBranchName(branch) {
  if (!branch) {
    log.error('分支名不能为空')
    process.exit(1)
  }

  // 基本的安全检查，防止命令注入
  if (!/^[a-zA-Z0-9._/-]+$/.test(branch)) {
    log.error('分支名包含非法字符')
    log.detail('只允许字母、数字、点、下划线、连字符和斜杠')
    process.exit(1)
  }

  return branch
}

/**
 * 检查工作区状态
 */
function checkWorkingDirectory() {
  try {
    const status = execGitCommand('git status --porcelain', { silent: true })
    const isClean = !status || !status.trim()

    if (!isClean) {
      log.warning('工作区有未提交的更改')
      log.detail('建议先提交或储藏更改再进行分支对比')

      // 显示具体的更改
      const statusLines = status.trim().split('\n')
      statusLines.slice(0, 5).forEach(line => {
        const status = line.substring(0, 2)
        const file = line.substring(3)
        let statusText = ''

        if (status.includes('M')) statusText = `${styles.yellow}修改${styles.reset}`
        else if (status.includes('A')) statusText = `${styles.green}新增${styles.reset}`
        else if (status.includes('D')) statusText = `${styles.red}删除${styles.reset}`
        else if (status.includes('??')) statusText = `${styles.gray}未跟踪${styles.reset}`

        log.detail(`${statusText} ${file}`)
      })

      if (statusLines.length > 5) {
        log.detail(`... 还有 ${statusLines.length - 5} 个文件`)
      }
    }

    return { isClean, changedFiles: status ? status.trim().split('\n').length : 0 }
  } catch {
    return { isClean: false, changedFiles: 0 }
  }
}

/**
 * 增强的分支存在性检查
 */
function checkBranchExists(branch) {
  // 如果是远程分支，先尝试 fetch
  if (branch.includes('/') && config.autoFetch) {
    log.info('获取远程分支最新信息...')
    execGitCommand('git fetch --all', { silent: true })
  }

  const checks = [
    `git show-ref --verify --quiet refs/heads/${branch}`,
    `git show-ref --verify --quiet refs/remotes/${branch}`,
    `git show-ref --verify --quiet refs/remotes/origin/${branch.replace('origin/', '')}`
  ]

  return checks.some(cmd => execGitCommand(cmd, { silent: true }) !== null)
}

/**
 * 获取增强的分支信息
 */
function getBranchInfo(branch) {
  try {
    // 一次性获取所需信息
    const format = "%h|%s|%ar|%an|%ae|%ad"
    const output = execGitCommand(`git log -1 --format="${format}" ${branch}`, { silent: true })

    if (!output) return null

    const [hash, message, relativeDate, author, email, absoluteDate] = output.trim().split('|')

    return {
      hash,
      message,
      relativeDate,
      author,
      email,
      absoluteDate,
      lastCommit: `${hash} ${message}`
    }
  } catch {
    return null
  }
}

/**
 * 检查分支关系
 */
function analyzeBranchRelationship(target) {
  try {
    // 检查是否有共同祖先
    const mergeBase = execGitCommand(`git merge-base HEAD ${target}`, { silent: true })

    if (!mergeBase) {
      return { relationship: 'unrelated', mergeBase: null }
    }

    const base = mergeBase.trim()

    // 检查是否是快进合并
    const currentHead = execGitCommand('git rev-parse HEAD', { silent: true })?.trim()
    const targetHead = execGitCommand(`git rev-parse ${target}`, { silent: true })?.trim()

    // 🎯 关键修复：先检查是否完全相等
    if (currentHead === targetHead) {
      return { relationship: 'synchronized', mergeBase: base, canFastForward: true }
    } else if (base === currentHead) {
      return { relationship: 'behind', mergeBase: base, canFastForward: true }
    } else if (base === targetHead) {
      return { relationship: 'ahead', mergeBase: base, canFastForward: true }
    } else {
      return { relationship: 'diverged', mergeBase: base, canFastForward: false }
    }
  } catch {
    return { relationship: 'unknown', mergeBase: null }
  }
}

/**
 * 获取详细的提交统计
 */
function getDetailedCommitStats(target) {
  try {
    const ahead = execGitCommand(`git rev-list --count ${target}..HEAD`, { silent: true })
    const behind = execGitCommand(`git rev-list --count HEAD..${target}`, { silent: true })

    // 获取变更的文件统计
    const statOutput = execGitCommand(`git diff --stat HEAD..${target}`, { silent: true })
    let filesChanged = 0, insertions = 0, deletions = 0

    if (statOutput) {
      const summaryLine = statOutput.split('\n').pop()
      const fileMatch = summaryLine.match(/(\d+) files? changed/)
      const insertMatch = summaryLine.match(/(\d+) insertions?/)
      const deleteMatch = summaryLine.match(/(\d+) deletions?/)

      filesChanged = fileMatch ? parseInt(fileMatch[1]) : 0
      insertions = insertMatch ? parseInt(insertMatch[1]) : 0
      deletions = deleteMatch ? parseInt(deleteMatch[1]) : 0
    }

    return {
      ahead: parseInt(ahead?.trim() || '0'),
      behind: parseInt(behind?.trim() || '0'),
      filesChanged,
      insertions,
      deletions
    }
  } catch {
    return { ahead: 0, behind: 0, filesChanged: 0, insertions: 0, deletions: 0 }
  }
}

/**
 * 主函数
 */
function main() {
  const args = parseArgs()

  // 检查基本环境
  checkIsGitRepo()

  if (!args.target) {
    log.title('Git 分支对比工具')
    log.error('请指定目标分支')
    console.log(`\n${styles.cyan}${icons.info} 使用方法:${styles.reset}`)
    console.log(`  bun run check-branch -- <分支名> [选项]`)
    console.log(`\n${styles.cyan}${icons.target} 选项:${styles.reset}`)
    console.log(`  --verbose     详细输出`)
    console.log(`  --no-fetch    跳过自动 fetch`)
    console.log(`  --format=json JSON 格式输出`)
    process.exit(1)
  }

  const targetBranch = validateBranchName(args.target)

  // 设置配置
  if (args.verbose) config.verbose = true
  if (args['no-fetch']) config.autoFetch = false
  if (args.format) config.format = args.format

  const currentBranch = execGitCommand('git branch --show-current', { silent: true })?.trim() || 'HEAD'

  // 检查工作区状态
  const workingDirStatus = checkWorkingDirectory()

  // 检查目标分支
  if (!checkBranchExists(targetBranch)) {
    log.error(`分支 "${targetBranch}" 不存在`)
    log.detail('可用分支列表:')
    execGitCommand('git branch -a')
    process.exit(1)
  }

  // 获取分支信息
  const currentInfo = getBranchInfo('HEAD')
  const targetInfo = getBranchInfo(targetBranch)
  const relationship = analyzeBranchRelationship(targetBranch)
  const stats = getDetailedCommitStats(targetBranch)

  // 输出分析结果
  if (config.format === 'json') {
    // JSON 格式输出
    console.log(JSON.stringify({
      currentBranch,
      targetBranch,
      workingDirectory: workingDirStatus,
      currentInfo,
      targetInfo,
      relationship,
      stats,
      timestamp: new Date().toISOString()
    }, null, 2))
    return
  }

  // 美化输出
  log.title(`${icons.compare} Git 分支对比分析`)

  // 工作区状态
  log.subtitle(`${workingDirStatus.isClean ? icons.clean : icons.dirty} 工作区状态`)
  if (workingDirStatus.isClean) {
    log.success('工作区干净，可以安全进行分支操作')
  } else {
    log.warning(`有 ${workingDirStatus.changedFiles} 个文件待处理`)
  }

  // 分支信息
  log.subtitle(`${icons.branch} 分支信息`)
  log.detail(`当前分支: ${styles.green}${currentBranch}${styles.reset}`)
  if (currentInfo) {
    log.detail(`最新提交: ${currentInfo.lastCommit} (${currentInfo.relativeDate})`)
    log.detail(`提交作者: ${currentInfo.author}`)
  }

  log.separator()
  log.detail(`目标分支: ${styles.blue}${targetBranch}${styles.reset}`)
  if (targetInfo) {
    log.detail(`最新提交: ${targetInfo.lastCommit} (${targetInfo.relativeDate})`)
    log.detail(`提交作者: ${targetInfo.author}`)
  }

  // 关系分析
  log.subtitle(`${icons.chart} 分支关系分析`)
  switch (relationship.relationship) {
    case 'synchronized':
      log.success(`分支完全同步，指向相同的提交`)
      break
    case 'ahead':
      log.success(`当前分支领先，可以快进推送到 ${targetBranch}`)
      break
    case 'behind':
      log.warning(`当前分支落后，可以快进合并 ${targetBranch}`)
      break
    case 'diverged':
      log.info('分支已分叉，需要合并操作')
      break
    case 'unrelated':
      log.warning('分支没有共同历史')
      break
    default:
      log.warning('无法确定分支关系')
  }

  // 统计信息
  log.subtitle(`${icons.file} 变更统计`)
  log.detail(`领先提交: ${styles.green}${stats.ahead}${styles.reset}`)
  log.detail(`落后提交: ${styles.red}${stats.behind}${styles.reset}`)
  log.detail(`变更文件: ${styles.blue}${stats.filesChanged}${styles.reset}`)
  log.detail(`新增行数: ${styles.green}+${stats.insertions}${styles.reset}`)
  log.detail(`删除行数: ${styles.red}-${stats.deletions}${styles.reset}`)

  // 建议操作
  log.subtitle(`${icons.target} 建议操作`)

  if (relationship.relationship === 'synchronized' || (stats.ahead === 0 && stats.behind === 0)) {
    log.success('分支完全同步，无需操作')
    if (!workingDirStatus.isClean) {
      log.info('可以继续在当前分支开发，或切换到目标分支')
    }
  } else {
    if (stats.behind > 0) {
      const command = relationship.canFastForward ?
        `git merge ${targetBranch}` :
        `git merge ${targetBranch} # 可能需要解决冲突`
      log.warning(`合并目标分支: ${styles.bold}${command}${styles.reset}`)
    }
    if (stats.ahead > 0) {
      log.info(`推送当前分支: ${styles.bold}git push origin ${currentBranch}${styles.reset}`)
    }
  }

  log.end()
}

// 执行主逻辑
main()
