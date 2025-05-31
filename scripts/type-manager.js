import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 自动生成类型索引文件
 * 扫描 types 目录下的所有 .d.ts 文件，自动生成 index.d.ts 文件
 * 支持根目录和 modules 子目录的类型声明文件
 *
 * @function generateTypeIndex
 * @description
 * 该函数会执行以下操作：
 * 1. 扫描 types 目录下的所有 .d.ts 文件（排除 index.d.ts）
 * 2. 扫描 types/modules 目录下的所有 .d.ts 文件
 * 3. 生成包含所有文件引用的 index.d.ts 文件
 * 4. 添加生成时间戳和文件统计信息
 *
 * @throws {Error} 当无法读取目录或写入文件时抛出错误
 *
 * @example
 * // 生成的 index.d.ts 文件格式：
 * // /// <reference path="./global.d.ts" />
 * // /// <reference path="./modules/form.d.ts" />
 * // export {}
 *
 * generateTypeIndex()
 */
function generateTypeIndex() {
  try {
    const typesDir = path.resolve(__dirname, '../src/types')
    const files = fs.readdirSync(typesDir, { withFileTypes: true })

    const references = []

    // 处理根目录的 .d.ts 文件
    files
      .filter(file => file.isFile() && file.name.endsWith('.d.ts') && file.name !== 'index.d.ts')
      .forEach(file => {
        references.push(`/// <reference path="./${file.name}" />`)
      })

    // 处理 modules 目录下的文件
    const modulesDir = path.resolve(typesDir, 'modules')
    if (fs.existsSync(modulesDir)) {
      const moduleFiles = fs.readdirSync(modulesDir)
      moduleFiles
        .filter(file => file.endsWith('.d.ts'))
        .forEach(file => {
          references.push(`/// <reference path="./modules/${file}" />`)
        })
    }

    const indexContent = `// 自动生成的类型索引文件
// 请勿手动编辑
// 生成时间: ${new Date().toISOString()}

${references.join('\n')}

export {}
`

    fs.writeFileSync(path.resolve(typesDir, 'index.d.ts'), indexContent)
    console.info('✅ 类型索引文件已生成')
    console.info(`📁 包含 ${references.length} 个类型声明文件`)
  } catch (error) {
    console.error(error,'❌ 生成类型索引文件失败:', error.message)
    throw error
  }
}

/**
 * 验证类型文件结构的完整性
 * 检查必需的类型声明文件是否存在
 *
 * @function validateTypeStructure
 * @returns {boolean} 如果所有必需文件都存在则返回 true，否则返回 false
 *
 * @description
 * 该函数会检查以下文件的存在性：
 * - 根目录必需文件：env.d.ts, global.d.ts, unocss.d.ts
 * - modules 目录必需文件：form.d.ts, menu.d.ts
 *
 * @example
 * const isValid = validateTypeStructure()
 * if (!isValid) {
 *   console.info('类型文件结构不完整')
 * }
 */
function validateTypeStructure() {
  try {
    const typesDir = path.resolve(__dirname, '../src/types')

    /** @type {string[]} 根目录必需的类型文件 */
    const requiredFiles = [
      'env.d.ts',
      'global.d.ts',
      'unocss.d.ts'
    ]

    /** @type {string[]} modules 目录必需的类型文件 */
    const requiredModules = [
      'modules/form.d.ts',
      'modules/menu.d.ts'
    ]

    const allRequired = [...requiredFiles, ...requiredModules]
    const missingFiles = allRequired.filter(file =>
      !fs.existsSync(path.resolve(typesDir, file))
    )

    if (missingFiles.length > 0) {
      console.warn('⚠️ 缺少类型文件:')
      missingFiles.forEach(file => console.warn(`   - ${file}`))
      return false
    } else {
      console.info('✅ 类型文件结构完整')
      return true
    }
  } catch (error) {
    console.error(error,'❌ 验证类型文件结构失败:', error.message)
    return false
  }
}

/**
 * 检查 TypeScript 类型文件的语法正确性
 * 使用 vue-tsc 进行类型检查，确保没有语法错误
 *
 * @function checkTypeSyntax
 * @returns {boolean} 如果语法检查通过则返回 true，否则返回 false
 *
 * @description
 * 该函数通过执行 `npx vue-tsc --noEmit` 命令来检查类型语法：
 * - --noEmit 参数确保只进行类型检查，不生成输出文件
 * - 适用于 Vue 项目的 TypeScript 类型检查
 * - 会检查所有 .ts、.vue 和 .d.ts 文件
 *
 * @throws {Error} 当 vue-tsc 命令执行失败时
 *
 * @example
 * const syntaxValid = checkTypeSyntax()
 * if (syntaxValid) {
 *   console.info('所有类型文件语法正确')
 * }
 */
function checkTypeSyntax() {
  try {
    execSync('npx vue-tsc --noEmit', { stdio: 'inherit' })
    console.info('✅ 类型语法检查通过')
    return true
  } catch (error) {
    console.error(error,'❌ 类型语法检查失败')
    return false
  }
}

/**
 * 主执行函数 - 完整的类型管理流程
 * 按顺序执行类型文件结构验证、索引生成和语法检查
 *
 * @function main
 * @returns {void}
 *
 * @description
 * 执行流程：
 * 1. 验证类型文件结构完整性
 * 2. 如果结构完整，生成类型索引文件
 * 3. 执行 TypeScript 语法检查
 * 4. 输出执行结果摘要
 * 5. 如果有任何步骤失败，则以错误状态退出进程
 *
 * @example
 * // 在命令行中直接运行脚本
 * // node type-manager.js
 *
 * // 或在代码中调用
 * import { main } from './type-manager.js'
 * main()
 */
function main() {
  console.info('🚀 开始类型管理任务...\n')

  // 1. 验证文件结构
  const structureValid = validateTypeStructure()

  // 2. 生成索引文件
  if (structureValid) {
    generateTypeIndex()
  }

  // 3. 语法检查
  const syntaxValid = checkTypeSyntax()

  console.info('\n📊 类型管理任务完成')
  console.info(`   结构检查: ${structureValid ? '✅' : '❌'}`)
  console.info(`   语法检查: ${syntaxValid ? '✅' : '❌'}`)

  if (!structureValid || !syntaxValid) {
    process.exit(1)
  }
}

// 检查是否为直接运行模式
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url)

if (isMainModule) {
  main()
}

export {
  generateTypeIndex,
  validateTypeStructure,
  checkTypeSyntax,
  main
}
