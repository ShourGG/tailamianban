// scripts/download-openapi.js
import fs from 'fs'

const APIFOX_LOCAL_URL = 'http://127.0.0.1:4523/export/openapi/2?version=3.0'
const OUTPUT_FILE = './openapi.json'

async function downloadOpenAPI() {
  try {
    console.log('🔄 正在从 Apifox 下载 OpenAPI 文档...')

    const response = await fetch(APIFOX_LOCAL_URL)

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.text()

    // 验证是否为有效的 JSON
    try {
      const jsonData = JSON.parse(data)
      // 检查是否是 OpenAPI 格式
      if (!jsonData.openapi && !jsonData.swagger) {
        throw new Error('下载的内容不是有效的 OpenAPI 格式')
      }
      console.log(
        '📋 检测到 OpenAPI 版本:',
        jsonData.openapi || jsonData.swagger
      )
    } catch {
      throw new Error('下载的内容不是有效的 JSON 格式')
    }

    fs.writeFileSync(OUTPUT_FILE, data, 'utf8')
    console.log('✅ OpenAPI 文档下载完成!')
    console.log('📁 保存位置:', OUTPUT_FILE)
    console.log('📊 文档信息:')
    console.log('   - 项目名称:', JSON.parse(data).info.title)
    console.log(
      '   - 接口数量:',
      Object.keys(JSON.parse(data).paths).length,
      '个'
    )
  } catch (error) {
    console.error('❌ 下载失败:', error.message)
    console.log('')
    console.log('💡 请检查:')
    console.log('   1. Apifox 客户端是否正在运行？')
    console.log('   2. 项目是否已在 Apifox 中打开？')
    process.exit(1)
  }
}

downloadOpenAPI()
