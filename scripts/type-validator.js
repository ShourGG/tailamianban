import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 验证 TypeScript 命名空间的一致性
 * 检查全局类型文件中定义的命名空间与模块文件中使用的命名空间是否一致
 *
 * @function validateNamespaces
 * @returns {boolean} 如果命名空间验证通过则返回 true，否则返回 false
 *
 * @description
 * 该函数执行以下验证步骤：
 * 1. 读取 global.d.ts 文件，提取所有定义的命名空间
 * 2. 扫描 modules 目录下的所有 .d.ts 文件
 * 3. 根据文件名推断期望的命名空间名称（首字母大写）
 * 4. 验证模块文件是否正确使用了对应的命名空间
 *
 * @example
 * // 假设 global.d.ts 中定义了:
 * // namespace Form { ... }
 * // namespace Menu { ... }
 *
 * // 则 modules/form.d.ts 应该包含: namespace Form { ... }
 * // modules/menu.d.ts 应该包含: namespace Menu { ... }
 *
 * const isValid = validateNamespaces()
 * if (isValid) {
 *   console.info('命名空间一致性验证通过')
 * }
 */
function validateNamespaces() {
  try {
    const typesDir = path.resolve(__dirname, '../src/types')
    const globalFile = path.resolve(typesDir, 'global.d.ts')

    if (!fs.existsSync(globalFile)) {
      console.error('❌ global.d.ts 文件不存在')
      return false
    }

    const globalContent = fs.readFileSync(globalFile, 'utf-8')

    /** @type {string[]} 从全局文件中提取的命名空间名称列表 */
    const namespaces = []

    // 提取全局文件中定义的命名空间
    // 匹配模式: namespace NamespaceName {
    const namespaceRegex = /namespace\s+(\w+)\s*{/g
    let match
    while ((match = namespaceRegex.exec(globalContent)) !== null) {
      namespaces.push(match[1])
    }

    console.info(`📋 检测到命名空间: ${namespaces.join(', ')}`)

    // 检查模块文件是否正确使用了命名空间
    const modulesDir = path.resolve(typesDir, 'modules')
    if (!fs.existsSync(modulesDir)) {
      console.warn('⚠️ modules 目录不存在')
      return true // 如果没有模块目录，认为验证通过
    }

    const moduleFiles = fs.readdirSync(modulesDir)
    let allValid = true

    for (const file of moduleFiles) {
      if (!file.endsWith('.d.ts')) continue

      const filePath = path.resolve(modulesDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const fileName = path.basename(file, '.d.ts')

      // 根据文件名生成期望的命名空间名称（首字母大写）
      const expectedNamespace =
        fileName.charAt(0).toUpperCase() + fileName.slice(1)

      if (namespaces.includes(expectedNamespace)) {
        const hasNamespace = content.includes(`namespace ${expectedNamespace}`)
        if (!hasNamespace) {
          console.warn(`⚠️ ${file} 应该使用 ${expectedNamespace} 命名空间`)
          allValid = false
        } else {
          console.info(`✅ ${file} 正确使用了 ${expectedNamespace} 命名空间`)
        }
      } else {
        console.warn(
          `⚠️ 未找到与 ${file} 对应的 ${expectedNamespace} 命名空间定义`
        )
      }
    }

    return allValid
  } catch (error) {
    console.error(error, '❌ 验证命名空间失败:', error.message)
    return false
  }
}

/**
 * 检查类型文件的导入导出一致性
 * 验证 index.d.ts 文件中的引用路径是否指向存在的文件
 *
 * @function validateImportsExports
 * @returns {boolean} 如果所有引用都有效则返回 true，否则返回 false
 *
 * @description
 * 该函数执行以下检查：
 * 1. 读取 index.d.ts 文件内容
 * 2. 使用正则表达式提取所有 triple-slash 引用指令
 * 3. 验证每个引用路径指向的文件是否真实存在
 * 4. 报告缺失的引用文件
 *
 * @example
 * // index.d.ts 文件内容示例:
 * // /// <reference path="./global.d.ts" />
 * // /// <reference path="./modules/form.d.ts" />
 *
 * const isValid = validateImportsExports()
 * if (isValid) {
 *   console.info('所有类型引用都有效')
 * }
 */
function validateImportsExports() {
  try {
    const typesDir = path.resolve(__dirname, '../src/types')
    const indexFile = path.resolve(typesDir, 'index.d.ts')

    if (!fs.existsSync(indexFile)) {
      console.error('❌ index.d.ts 文件不存在')
      return false
    }

    const indexContent = fs.readFileSync(indexFile, 'utf-8')

    /** @type {string[]} 从索引文件中提取的引用路径列表 */
    const references = []

    // 提取所有 triple-slash 引用指令
    // 匹配模式: /// <reference path="相对路径" />
    const referenceRegex = /\/\/\/\s*<reference\s+path="([^"]+)"\s*\/>/g
    let match
    while ((match = referenceRegex.exec(indexContent)) !== null) {
      references.push(match[1])
    }

    console.info(`📋 检测到 ${references.length} 个类型引用`)

    let allValid = true

    // 检查引用的文件是否存在
    for (const ref of references) {
      const refPath = path.resolve(typesDir, ref)
      if (!fs.existsSync(refPath)) {
        console.error(`❌ 引用的文件不存在: ${ref}`)
        allValid = false
      } else {
        console.info(`✅ 引用文件存在: ${ref}`)
      }
    }

    return allValid
  } catch (error) {
    console.error(error, '❌ 验证导入导出失败:', error.message)
    return false
  }
}

/**
 * 主验证函数 - 完整的类型一致性检查
 * 执行命名空间一致性和引用关系的完整验证流程
 *
 * @function validateTypes
 * @returns {boolean} 如果所有验证都通过则返回 true，否则返回 false
 *
 * @description
 * 该函数是类型验证的入口点，执行以下检查：
 * 1. 命名空间一致性验证 - 确保模块文件正确使用命名空间
 * 2. 引用关系验证 - 确保索引文件中的所有引用都指向有效文件
 * 3. 输出详细的验证结果报告
 *
 * @example
 * // 在构建脚本中使用
 * import { validateTypes } from './type-validator.js'
 *
 * const isValid = validateTypes()
 * if (!isValid) {
 *   console.error('类型验证失败，请检查类型文件')
 *   process.exit(1)
 * }
 *
 * // 命令行直接运行
 * // node type-validator.js
 */
function validateTypes() {
  console.info('🔍 开始类型验证...\n')

  // 执行命名空间一致性验证
  const namespaceValid = validateNamespaces()
  console.info() // 添加空行分隔

  // 执行导入导出一致性验证
  const importValid = validateImportsExports()

  // 输出验证结果摘要
  console.info('\n📊 验证结果:')
  console.info(`   命名空间: ${namespaceValid ? '✅ 通过' : '❌ 失败'}`)
  console.info(`   引用关系: ${importValid ? '✅ 通过' : '❌ 失败'}`)

  const allValid = namespaceValid && importValid
  console.info(`   总体结果: ${allValid ? '✅ 通过' : '❌ 失败'}`)

  if (!allValid) {
    console.info('\n💡 建议:')
    if (!namespaceValid) {
      console.info('   - 检查模块文件是否正确使用了对应的命名空间')
      console.info('   - 确保 global.d.ts 中定义了所需的命名空间')
    }
    if (!importValid) {
      console.info('   - 检查 index.d.ts 中的引用路径是否正确')
      console.info('   - 确保所有被引用的类型文件都存在')
    }
  }

  return allValid
}

// 检查是否为直接运行模式
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url)

if (isMainModule) {
  const isValid = validateTypes()
  if (!isValid) {
    process.exit(1)
  }
}

export { validateNamespaces, validateImportsExports, validateTypes }
