#!/usr/bin/env node

import { execSync } from 'child_process'

/**
 * 精致版 Git 分支对比工具
 * 使用方法: node scripts/check-branch.js <target-branch>
 */

// 精致的颜色和样式工具
const styles = {
  // 基础颜色
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // 文字颜色
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // 背景颜色
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
}

// 精致的图标
const icons = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
  branch: '🌿',
  compare: '🔍',
  file: '📄',
  plus: '✨',
  minus: '🗑️',
  equal: '🟰',
  chart: '📊',
  history: '📚',
  target: '🎯',
}

// 精致的日志工具
const log = {
  title: msg =>
    console.log(`\n${styles.bold}${styles.cyan}╭─ ${msg} ─╮${styles.reset}`),
  subtitle: msg =>
    console.log(`${styles.bold}${styles.blue}├─ ${msg}${styles.reset}`),
  success: msg =>
    console.log(`${styles.green}${icons.success} ${msg}${styles.reset}`),
  warning: msg =>
    console.log(`${styles.yellow}${icons.warning} ${msg}${styles.reset}`),
  error: msg =>
    console.log(`${styles.red}${icons.error} ${msg}${styles.reset}`),
  info: msg => console.log(`${styles.blue}${icons.info} ${msg}${styles.reset}`),
  branch: msg =>
    console.log(`${styles.green}${icons.branch} ${msg}${styles.reset}`),
  detail: msg => console.log(`${styles.gray}  │ ${msg}${styles.reset}`),
  separator: () =>
    console.log(`${styles.gray}  ├${'─'.repeat(50)}${styles.reset}`),
  end: () => console.log(`${styles.cyan}╰${'─'.repeat(52)}╯${styles.reset}\n`),
}

// 获取目标分支参数
const targetBranch = process.argv[2]

if (!targetBranch) {
  log.title('Git 分支对比工具')
  log.error('请指定目标分支')
  console.log(`\n${styles.cyan}${icons.info} 使用方法:${styles.reset}`)
  console.log(`  ${styles.bold}bun run check-branch -- <分支名>${styles.reset}`)
  console.log(`\n${styles.cyan}${icons.target} 示例:${styles.reset}`)
  console.log(`  bun run check-branch -- main`)
  console.log(`  bun run check-branch -- origin/develop`)
  console.log(`  bun run check-branch -- feature/new-ui\n`)
  process.exit(1)
}

/**
 * 安全执行 Git 命令
 */
function execGitCommand(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
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
 * 检查分支是否存在
 */
function checkBranchExists(branch) {
  const localExists =
    execGitCommand(`git show-ref --verify --quiet refs/heads/${branch}`, {
      silent: true,
    }) !== null
  const remoteExists =
    execGitCommand(`git show-ref --verify --quiet refs/remotes/${branch}`, {
      silent: true,
    }) !== null
  return localExists || remoteExists
}

/**
 * 获取分支信息
 */
function getBranchInfo(branch) {
  try {
    const lastCommit = execSync(`git log -1 --format="%h %s" ${branch}`, {
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim()
    const commitDate = execSync(`git log -1 --format="%ar" ${branch}`, {
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim()
    return { lastCommit, commitDate }
  } catch {
    return { lastCommit: 'unknown', commitDate: 'unknown' }
  }
}

/**
 * 格式化差异统计
 */
function formatDiffStat(statOutput) {
  if (!statOutput || !statOutput.trim()) {
    return `${styles.gray}  │ (无文件差异)${styles.reset}`
  }

  const lines = statOutput.split('\n')
  let result = ''

  lines.forEach(line => {
    if (line.includes('|')) {
      // 文件差异行
      const parts = line.split('|')
      if (parts.length >= 2) {
        const filename = parts[0].trim()
        const changes = parts[1].trim()

        // 处理 +++ 和 --- 符号，添加颜色
        const coloredChanges = changes
          .replace(/\+/g, `${styles.green}+${styles.reset}`)
          .replace(/-/g, `${styles.red}-${styles.reset}`)

        result += `${styles.gray}  │${styles.reset} ${styles.cyan}${filename}${styles.reset} ${styles.gray}│${styles.reset} ${coloredChanges}\n`
      }
    } else if (
      line.includes('changed') ||
      line.includes('insertion') ||
      line.includes('deletion')
    ) {
      // 汇总行
      const coloredSummary = line
        .replace(
          /(\d+)\s+insertion/g,
          `${styles.green}$1 insertion${styles.reset}`
        )
        .replace(/(\d+)\s+deletion/g, `${styles.red}$1 deletion${styles.reset}`)
        .replace(/(\d+)\s+file/g, `${styles.blue}$1 file${styles.reset}`)

      result += `${styles.gray}  │${styles.reset} ${styles.bold}${coloredSummary}${styles.reset}\n`
    }
  })

  return result.trim()
}

/**
 * 检查是否有差异
 */
function checkDifferences(target) {
  try {
    execSync(`git diff --quiet HEAD..${target}`, { stdio: 'pipe' })
    return false // 无差异
  } catch {
    return true // 有差异
  }
}

/**
 * 获取提交数量差异
 */
function getCommitCounts(target) {
  try {
    const ahead = execSync(`git rev-list --count ${target}..HEAD`, {
      encoding: 'utf8',
      stdio: 'pipe',
    })
    const behind = execSync(`git rev-list --count HEAD..${target}`, {
      encoding: 'utf8',
      stdio: 'pipe',
    })
    return {
      ahead: parseInt(ahead.trim()) || 0,
      behind: parseInt(behind.trim()) || 0,
    }
  } catch {
    return { ahead: 0, behind: 0 }
  }
}

/**
 * 格式化提交历史
 */
function formatCommitHistory(logOutput) {
  if (!logOutput || !logOutput.trim()) {
    return `${styles.gray}  │ (无提交差异)${styles.reset}`
  }

  const lines = logOutput.split('\n').filter(line => line.trim())
  let result = ''

  lines.slice(0, 10).forEach(line => {
    // 只显示前10个提交
    if (line.includes('<')) {
      // 当前分支的提交
      result += `${styles.gray}  │${styles.reset} ${styles.green}◀${styles.reset} ${line.replace('<', '').trim()}\n`
    } else if (line.includes('>')) {
      // 目标分支的提交
      result += `${styles.gray}  │${styles.reset} ${styles.blue}▶${styles.reset} ${line.replace('>', '').trim()}\n`
    } else {
      // 其他格式
      result += `${styles.gray}  │${styles.reset} ${line}\n`
    }
  })

  if (lines.length > 10) {
    result += `${styles.gray}  │ ... 还有 ${lines.length - 10} 个提交${styles.reset}\n`
  }

  return result.trim()
}

/**
 * 主要检查逻辑
 */
function main() {
  const currentBranch =
    execGitCommand('git branch --show-current', { silent: true })?.trim() ||
    'unknown'

  // 标题
  log.title(`${icons.compare} Git 分支对比分析`)

  // 分支信息对比
  log.subtitle(`${icons.branch} 分支信息对比`)

  const currentInfo = getBranchInfo('HEAD')
  log.detail(
    `${styles.bold}当前分支:${styles.reset} ${styles.green}${currentBranch}${styles.reset}`
  )
  log.detail(
    `${styles.dim}最新提交: ${currentInfo.lastCommit} (${currentInfo.commitDate})${styles.reset}`
  )

  log.separator()

  // 检查目标分支是否存在
  if (!checkBranchExists(targetBranch)) {
    log.error(`分支 "${targetBranch}" 不存在`)
    log.detail('可用分支列表:')
    execGitCommand('git branch -a')
    log.end()
    process.exit(1)
  }

  const targetInfo = getBranchInfo(targetBranch)
  log.detail(
    `${styles.bold}目标分支:${styles.reset} ${styles.blue}${targetBranch}${styles.reset}`
  )
  log.detail(
    `${styles.dim}最新提交: ${targetInfo.lastCommit} (${targetInfo.commitDate})${styles.reset}`
  )

  // 提交数量对比
  log.subtitle(`${icons.chart} 提交数量对比`)
  const commitCounts = getCommitCounts(targetBranch)

  if (commitCounts.ahead > 0) {
    log.detail(
      `${styles.green}${icons.plus} 当前分支领先 ${commitCounts.ahead} 个提交${styles.reset}`
    )
  }
  if (commitCounts.behind > 0) {
    log.detail(
      `${styles.red}${icons.minus} 当前分支落后 ${commitCounts.behind} 个提交${styles.reset}`
    )
  }
  if (commitCounts.ahead === 0 && commitCounts.behind === 0) {
    log.detail(`${styles.green}${icons.equal} 提交进度完全同步${styles.reset}`)
  }

  // 文件差异统计
  log.subtitle(`${icons.file} 文件差异统计`)
  const statResult = execGitCommand(`git diff --stat HEAD..${targetBranch}`, {
    silent: true,
  })
  console.log(formatDiffStat(statResult))

  // 整体差异结果
  log.subtitle(`${icons.target} 差异检查结果`)
  const hasDifferences = checkDifferences(targetBranch)

  if (hasDifferences) {
    if (commitCounts.behind > 0) {
      log.warning(
        `需要合并 ${commitCounts.behind} 个来自 ${targetBranch} 的提交`
      )
    } else {
      log.info(`当前分支领先，可以向 ${targetBranch} 推送更新`)
    }
  } else {
    log.success('代码完全一致，无需合并')
  }

  // 提交历史详情
  if (commitCounts.ahead > 0 || commitCounts.behind > 0) {
    log.subtitle(`${icons.history} 提交历史详情`)
    const logResult = execGitCommand(
      `git log --left-right --oneline HEAD...${targetBranch}`,
      { silent: true }
    )
    console.log(formatCommitHistory(logResult))
  }

  // 总结报告
  log.subtitle(`${icons.target} 总结报告`)
  if (hasDifferences) {
    if (commitCounts.behind > 0) {
      log.warning(
        `建议执行: ${styles.bold}git merge ${targetBranch}${styles.reset}`
      )
    }
    if (commitCounts.ahead > 0) {
      log.info(
        `可以推送到远程: ${styles.bold}git push origin ${currentBranch}${styles.reset}`
      )
    }
  } else {
    log.success(
      `分支 ${styles.bold}${targetBranch}${styles.reset} 与当前分支完全同步`
    )
  }

  log.end()
}

// 执行主逻辑
main()
