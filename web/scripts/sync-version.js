/**
 * 同步版本号脚本
 * 从 package.json 读取版本号并写入到 src/config/version.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

try {
  // 读取 package.json
  const packageJsonPath = join(__dirname, '../package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const version = packageJson.version

  // 确保目录存在
  const configDir = join(__dirname, '../src/config')
  mkdirSync(configDir, { recursive: true })

  // 生成 version.ts 内容
  const versionTsContent = `/**
 * 版本号配置
 * 此文件由构建脚本自动生成，请勿手动修改
 */
export const VERSION = '${version}'
`

  // 写入文件
  const versionTsPath = join(configDir, 'version.ts')
  writeFileSync(versionTsPath, versionTsContent, 'utf-8')

  console.log(`✓ 版本号同步成功: ${version}`)
} catch (error) {
  console.error('✗ 版本号同步失败:', error.message)
  process.exit(1)
}