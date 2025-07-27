<template>
  <div class="c-file-preview">
    <!-- 文件信息头部 -->
    <div class="preview-header">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <NTag
            :type="getFileConfig(fileType).tagType"
            size="small"
          >
            <template #icon>
              <Icon :icon="getFileConfig(fileType).icon" />
            </template>
            {{ fileType.toUpperCase() }}
          </NTag>
          <NEllipsis style="max-width: 300px">
            {{ fileName }}
          </NEllipsis>
          <span class="text-sm text-gray-500">{{
            formatFileSize(fileSize)
          }}</span>
        </div>

        <div class="flex gap-2">
          <NButton
            size="small"
            type="tertiary"
            @click="downloadFile"
            :disabled="loading"
          >
            <template #icon>
              <Icon icon="ic:outline-download" />
            </template>
            下载
          </NButton>
          <NButton
            size="small"
            type="tertiary"
            @click="refreshPreview"
            :disabled="loading"
          >
            <template #icon>
              <Icon icon="ic:outline-refresh" />
            </template>
            刷新
          </NButton>
        </div>
      </div>
    </div>

    <!-- 预览内容区域 -->
    <div class="preview-content">
      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="h-full flex items-center justify-center"
      >
        <NSpin size="large">
          <template #description>
            正在加载{{ fileType.toUpperCase() }}文件...
          </template>
        </NSpin>
      </div>

      <!-- 错误状态 -->
      <NResult
        v-else-if="error"
        status="error"
        title="预览失败"
        :description="error"
        class="h-full flex items-center justify-center"
      >
        <template #footer>
          <div class="flex flex-col gap-3">
            <NButton @click="refreshPreview">重试</NButton>

            <!-- 文件不存在的特殊提示 -->
            <div
              v-if="error.includes('文件不存在') || error.includes('HTTP 404')"
              class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left"
            >
              <h4 class="font-semibold text-yellow-800 mb-2"
                >📁 文件路径问题解决方案</h4
              >
              <div class="text-sm text-yellow-700 space-y-2">
                <p
                  ><strong>当前路径:</strong>
                  <code class="bg-yellow-100 px-1 rounded">{{
                    props.url
                  }}</code></p
                >
                <div>
                  <strong>请检查:</strong>
                  <ul class="list-disc list-inside mt-1 space-y-1">
                    <li>文件是否真实存在于服务器上</li>
                    <li>文件路径是否正确（区分大小写）</li>
                    <li>服务器是否允许访问该目录</li>
                    <li>文件权限是否正确设置</li>
                  </ul>
                </div>
                <div>
                  <strong>建议路径格式:</strong>
                  <ul
                    class="list-disc list-inside mt-1 space-y-1 font-mono text-xs"
                  >
                    <li><code>/public/files/sample.xlsx</code></li>
                    <li><code>https://example.com/files/sample.xlsx</code></li>
                    <li><code>./assets/sample.xlsx</code></li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 调试信息 -->
            <details class="text-left text-sm">
              <summary class="cursor-pointer text-gray-600"
                >查看详细调试信息</summary
              >
              <div class="mt-2 p-3 bg-gray-50 rounded text-xs space-y-1">
                <div><strong>文件名:</strong> {{ fileName }}</div>
                <div><strong>文件类型:</strong> {{ fileType }}</div>
                <div v-if="props.file"
                  ><strong>文件大小:</strong>
                  {{ formatFileSize(fileSize) }}</div
                >
                <div v-if="props.url"
                  ><strong>原始URL:</strong> {{ props.url }}</div
                >
                <div v-if="props.url"
                  ><strong>处理后URL:</strong>
                  {{ validateAndFormatUrl(props.url) }}</div
                >
                <div><strong>浏览器:</strong> {{ getBrowserInfo() }}</div>
                <div><strong>错误信息:</strong> {{ error }}</div>
              </div>
            </details>
          </div>
        </template>
      </NResult>

      <!-- PDF预览 -->
      <div
        v-else-if="fileType === 'pdf'"
        class="pdf-container"
      >
        <div class="pdf-toolbar">
          <div class="flex justify-between items-center">
            <div class="flex gap-2 items-center">
              <NButton
                size="small"
                @click="changePage('prev')"
                :disabled="currentPage <= 1"
              >
                <template #icon
                  ><Icon icon="ic:outline-chevron-left"
                /></template>
              </NButton>
              <NInputNumber
                v-model:value="currentPage"
                size="small"
                :min="1"
                :max="totalPages"
                @update:value="changePage"
                style="width: 80px"
              />
              <span class="text-sm text-gray-600">/ {{ totalPages }}</span>
              <NButton
                size="small"
                @click="changePage('next')"
                :disabled="currentPage >= totalPages"
              >
                <template #icon
                  ><Icon icon="ic:outline-chevron-right"
                /></template>
              </NButton>
            </div>

            <div class="flex gap-2 items-center">
              <NButton
                size="small"
                @click="adjustZoom('pdf', 'out')"
                :disabled="scale <= 0.5"
              >
                <template #icon><Icon icon="ic:outline-zoom-out" /></template>
              </NButton>
              <span class="text-sm text-gray-600 min-w-12 text-center"
                >{{ Math.round(scale * 100) }}%</span
              >
              <NButton
                size="small"
                @click="adjustZoom('pdf', 'in')"
                :disabled="scale >= 3"
              >
                <template #icon><Icon icon="ic:outline-zoom-in" /></template>
              </NButton>
              <NButton
                size="small"
                @click="adjustZoom('pdf', 'reset')"
              >
                <template #icon><Icon icon="ic:outline-fit-screen" /></template>
                适应
              </NButton>
            </div>
          </div>
        </div>
        <div
          class="pdf-viewer"
          ref="pdfContainer"
        >
          <iframe
            v-if="pdfUrl"
            :src="pdfUrl"
            class="w-full h-full border-0"
            title="PDF预览"
            frameborder="0"
            allowfullscreen
            @load="onPdfLoad"
            @error="onPdfError"
          />
        </div>
      </div>

      <!-- Word预览 -->
      <div
        v-else-if="fileType === 'word'"
        class="word-container"
      >
        <div class="word-layout">
          <!-- Word工具栏 -->
          <div class="word-toolbar">
            <div class="flex gap-2 items-center">
              <NButton
                size="small"
                @click="toggleOutline"
              >
                <template #icon><Icon icon="ic:outline-list" /></template>
                {{ showOutline ? '隐藏' : '显示' }}目录
              </NButton>
              <NDivider vertical />
              <NButton
                size="small"
                @click="adjustZoom('word', 'out')"
              >
                <template #icon><Icon icon="ic:outline-zoom-out" /></template>
              </NButton>
              <span class="text-sm text-gray-600 min-w-12 text-center"
                >{{ wordZoom }}%</span
              >
              <NButton
                size="small"
                @click="adjustZoom('word', 'in')"
              >
                <template #icon><Icon icon="ic:outline-zoom-in" /></template>
              </NButton>
              <NButton
                size="small"
                @click="adjustZoom('word', 'reset')"
              >
                <template #icon><Icon icon="ic:outline-fit-screen" /></template>
                重置
              </NButton>
            </div>
          </div>

          <div class="word-main">
            <!-- 侧边栏目录 -->
            <div
              v-if="showOutline"
              class="word-outline"
            >
              <div class="outline-header">
                <h3 class="text-sm font-semibold">文档目录</h3>
              </div>
              <div class="outline-content">
                <div
                  v-for="(heading, index) in headings"
                  :key="index"
                  class="outline-item"
                  :class="`level-${heading.level}`"
                  @click="scrollToHeading(heading.id)"
                >
                  {{ heading.text }}
                </div>
              </div>
            </div>

            <!-- 主要内容区域 -->
            <div
              class="word-content"
              ref="wordContentRef"
            >
              <div
                class="word-document"
                :style="{
                  transform: `scale(${wordZoom / 100})`,
                  transformOrigin: 'top center',
                }"
                v-html="wordContent"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Excel预览 -->
      <div
        v-else-if="fileType === 'excel'"
        class="excel-container"
      >
        <!-- Excel工具栏 -->
        <div class="excel-toolbar">
          <div class="flex justify-between items-center">
            <div class="flex gap-2 items-center">
              <NTabs
                v-if="excelSheets.length > 1"
                v-model:value="activeSheet"
                type="card"
                size="small"
              >
                <NTabPane
                  v-for="sheet in excelSheets"
                  :key="sheet.name"
                  :name="sheet.name"
                  :tab="sheet.name"
                />
              </NTabs>
              <span
                v-else
                class="text-sm text-gray-600"
                >工作表: {{ activeSheet }}</span
              >
            </div>

            <div class="flex gap-2 items-center">
              <NButton
                size="small"
                @click="toggleExcelFormat"
              >
                <template #icon
                  ><Icon icon="ic:outline-format-paint"
                /></template>
                {{ showExcelFormat ? '紧凑视图' : '完整格式' }}
              </NButton>
            </div>
          </div>
        </div>

        <div class="excel-viewer">
          <!-- Excel信息面板 -->
          <div
            class="excel-info"
            v-if="excelData.length > 0"
          >
            <NText
              depth="3"
              class="text-sm"
            >
              当前工作表: {{ activeSheet }} | 总行数: {{ excelData.length }} |
              总列数: {{ excelColumns.length }} | 当前页:
              {{ currentExcelPage }}/{{ totalExcelPages }}
            </NText>
          </div>

          <!-- Excel表格 - 支持合并单元格 -->
          <div class="excel-table-container">
            <div
              class="excel-table-wrapper"
              :class="{ 'simple-mode': !showExcelFormat }"
            >
              <table
                class="excel-table"
                v-if="excelData.length > 0"
              >
                <thead>
                  <tr>
                    <th class="row-number">行号</th>
                    <th
                      v-for="(col, index) in excelColumns"
                      :key="col.key"
                      class="excel-header"
                      :style="{ minWidth: col.width + 'px' }"
                    >
                      <div class="header-content">
                        <span class="column-letter">{{
                          getColumnLetter(index)
                        }}</span>
                        <span class="column-title">{{ col.title }}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in paginatedExcelData"
                    :key="rowIndex"
                    class="excel-row"
                  >
                    <td class="row-number">{{
                      (currentExcelPage - 1) * pageSize + rowIndex + 1
                    }}</td>
                    <td
                      v-for="col in excelColumns"
                      :key="col.key"
                      v-show="!row[col.key]?.hidden"
                      class="excel-cell"
                      :class="[
                        getCellClass(row[col.key]?.value),
                        row[col.key]?.merged ? 'merged-cell' : '',
                        !showExcelFormat ? 'compact-cell' : '',
                      ]"
                      :rowspan="row[col.key]?.rowspan || 1"
                      :colspan="row[col.key]?.colspan || 1"
                      :title="row[col.key]?.value"
                    >
                      {{ formatCellValue(row[col.key]?.value) }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div
                v-else
                class="excel-empty"
              >
                <NEmpty description="该工作表没有数据或解析失败">
                  <template #extra>
                    <NButton
                      size="small"
                      @click="refreshPreview"
                    >
                      重新解析
                    </NButton>
                  </template>
                </NEmpty>
              </div>
            </div>

            <!-- 分页控制 -->
            <div
              class="excel-pagination"
              v-if="totalExcelPages > 1"
            >
              <NPagination
                v-model:page="currentExcelPage"
                :page-count="totalExcelPages"
                :page-size="pageSize"
                show-size-picker
                :page-sizes="[20, 50, 100, 200]"
                @update:page-size="handlePageSizeChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 不支持的文件类型 -->
      <NResult
        v-else
        status="warning"
        title="不支持的文件格式"
        :description="`暂不支持预览 ${fileType.toUpperCase()} 格式文件`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import * as XLSX from 'xlsx'
  import mammoth from 'mammoth'
  import { Icon } from '@iconify/vue'

  interface Props {
    file?: File
    url?: string
    fileName?: string
  }

  interface ExcelCell {
    value: any
    rowspan?: number
    colspan?: number
    merged?: boolean
    hidden?: boolean
    style?: any
  }

  interface ExcelRow {
    [key: string]: ExcelCell
  }

  interface ExcelSheet {
    name: string
    data: ExcelRow[]
    merges: any[]
    columns: any[]
  }

  interface Heading {
    id: string
    text: string
    level: number
  }

  const props = withDefaults(defineProps<Props>(), {
    fileName: '未知文件',
  })

  // 基础状态
  const loading = ref(false)
  const error = ref('')
  const fileType = ref('')
  const fileSize = ref(0)
  const fileName = computed(
    () => props.fileName || props.file?.name || '未知文件'
  )

  // PDF相关状态
  const pdfUrl = ref('')
  const currentPage = ref(1)
  const totalPages = ref(0)
  const scale = ref(1)
  const pdfContainer = ref<HTMLElement>()

  // Word相关状态
  const wordContent = ref('')
  const wordZoom = ref(100)
  const showOutline = ref(true)
  const headings = ref<Heading[]>([])
  const wordContentRef = ref<HTMLElement>()

  // Excel相关状态
  const excelSheets = ref<ExcelSheet[]>([])
  const activeSheet = ref('')
  const excelColumns = ref<any[]>([])
  const excelData = ref<ExcelRow[]>([])
  const excelMerges = ref<any[]>([])
  const showExcelFormat = ref(false)
  const currentExcelPage = ref(1)
  const pageSize = ref(50)

  const totalExcelPages = computed(() => {
    return Math.ceil(excelData.value.length / pageSize.value)
  })

  const paginatedExcelData = computed(() => {
    const start = (currentExcelPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return excelData.value.slice(start, end)
  })

  // 工具函数
  const getFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const typeMap: Record<string, string> = {
      pdf: 'pdf',
      doc: 'word',
      docx: 'word',
      xls: 'excel',
      xlsx: 'excel',
    }
    return typeMap[ext!] || 'unknown'
  }

  const getFileConfig = (type: string) => {
    const configs: Record<string, { tagType: string; icon: string }> = {
      pdf: { tagType: 'error', icon: 'ic:outline-picture-as-pdf' },
      word: { tagType: 'info', icon: 'ic:outline-description' },
      excel: { tagType: 'success', icon: 'ic:outline-grid-on' },
      unknown: { tagType: 'default', icon: 'ic:outline-insert-drive-file' },
    }
    return configs[type] || configs.unknown
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // 缩放控制
  const adjustPdfZoom = (action: 'in' | 'out' | 'reset') => {
    if (action === 'in' && scale.value < 3) {
      scale.value += 0.25
    } else if (action === 'out' && scale.value > 0.5) {
      scale.value -= 0.25
    } else if (action === 'reset') {
      scale.value = 1
    }
  }

  const adjustWordZoom = (action: 'in' | 'out' | 'reset') => {
    if (action === 'in' && wordZoom.value < 200) {
      wordZoom.value += 10
    } else if (action === 'out' && wordZoom.value > 50) {
      wordZoom.value -= 10
    } else if (action === 'reset') {
      wordZoom.value = 100
    }
  }

  const adjustZoom = (type: 'pdf' | 'word', action: 'in' | 'out' | 'reset') => {
    if (type === 'pdf') {
      adjustPdfZoom(action)
    } else {
      adjustWordZoom(action)
    }
  }

  // 页面控制
  const changePage = (action: 'prev' | 'next' | number) => {
    if (typeof action === 'number') {
      if (action >= 1 && action <= totalPages.value) {
        currentPage.value = action
      }
    } else if (action === 'prev' && currentPage.value > 1) {
      currentPage.value--
    } else if (action === 'next' && currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  // Excel操作
  const toggleExcelFormat = () => {
    showExcelFormat.value = !showExcelFormat.value
  }
  const toggleOutline = () => {
    showOutline.value = !showOutline.value
  }
  const handlePageSizeChange = (newPageSize: number) => {
    pageSize.value = newPageSize
    currentExcelPage.value = 1
  }

  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const getBrowserInfo = (): string => {
    try {
      const { userAgent } = window.navigator || {}
      return userAgent
        ? userAgent.split(' ').slice(-2).join(' ')
        : 'Unknown Browser'
    } catch {
      return 'Unknown Browser'
    }
  }

  // PDF事件处理
  const onPdfLoad = () => console.log('PDF iframe加载成功')
  const onPdfError = (event: any) => {
    console.error('PDF iframe加载失败:', event)
    setError('PDF文件无法显示，可能是文件损坏或浏览器不支持')
  }

  // Excel工具函数
  const getColumnLetter = (index: number): string => {
    let result = ''
    while (index >= 0) {
      result = String.fromCharCode(65 + (index % 26)) + result
      index = Math.floor(index / 26) - 1
    }
    return result
  }

  const formatCellValue = (value: any): string => {
    if (!value) return ''
    const strValue = String(value).trim()

    if (!isNaN(Number(strValue)) && strValue !== '' && strValue.length < 15) {
      const num = Number(strValue)
      return Number.isInteger(num)
        ? num.toLocaleString()
        : num.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }
    return strValue
  }

  const getCellClass = (value: any): string => {
    if (!value) return 'cell-empty'
    const strValue = String(value).trim()

    if (!isNaN(Number(strValue)) && strValue !== '') return 'cell-number'
    if (strValue.match(/[■▬▪▫─━]/)) return 'cell-gantt'
    if (
      strValue.match(/^\d{4}[-/]\d{2}[-/]\d{2}/) ||
      strValue.match(/^\d{2}[-/]\d{2}[-/]\d{4}/)
    )
      return 'cell-date'
    if (['true', 'false'].includes(strValue.toLowerCase()))
      return 'cell-boolean'
    return strValue.length > 20 ? 'cell-text cell-long' : 'cell-text'
  }

  // Excel处理函数
  const calculateColumnWidth = (columnName: string, index: number): number => {
    const isNumeric = /^\d+$/.test(columnName)
    const isDescription =
      index <= 1 || columnName.includes('项目') || columnName.includes('施工')

    if (isNumeric) return 45
    if (isDescription)
      return Math.min(Math.max(columnName.length * 14, 120), 200)
    return Math.min(Math.max(columnName.length * 12, 80), 150)
  }

  const generateExcelColumnConfig = (worksheet: any, maxCol: number) => {
    const columns = []
    for (let c = 0; c <= maxCol; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c })
      const cell = worksheet[cellAddress]
      const columnName = cell ? String(cell.v || '').trim() : `列${c + 1}`
      const width = calculateColumnWidth(columnName, c)

      columns.push({
        title: columnName || `列${c + 1}`,
        key: `col_${c}`,
        width,
      })
    }
    return columns
  }

  const createMergeMap = (merges: any[]) => {
    const mergeMap = new Map()
    merges.forEach(({ s: { r: sRow, c: sCol }, e: { r: eRow, c: eCol } }) => {
      for (let r = sRow; r <= eRow; r++) {
        for (let c = sCol; c <= eCol; c++) {
          mergeMap.set(`${r}-${c}`, {
            isMain: r === sRow && c === sCol,
            rowspan: eRow - sRow + 1,
            colspan: eCol - sCol + 1,
            mainRow: sRow,
            mainCol: sCol,
          })
        }
      }
    })
    return mergeMap
  }
  const processCellData = (
    worksheet: any,
    r: number,
    c: number,
    mergeMap: Map<string, any>
  ): ExcelCell => {
    const cellAddress = XLSX.utils.encode_cell({ r, c })
    const cell = worksheet[cellAddress]
    const mergeInfo = mergeMap.get(`${r}-${c}`)

    const cellData: ExcelCell = {
      value: cell ? cell.v || '' : '',
      merged: !!mergeInfo,
      hidden: false,
      rowspan: 1,
      colspan: 1,
    }

    if (mergeInfo) {
      const { isMain, rowspan, colspan } = mergeInfo
      if (isMain) {
        cellData.rowspan = rowspan
        cellData.colspan = colspan
      } else {
        cellData.hidden = true
        cellData.value = ''
      }
    }

    return cellData
  }

  const processExcelDataWithMerges = (
    worksheet: any,
    range: any,
    merges: any[]
  ) => {
    const rows: ExcelRow[] = []
    const { e: endRange } = range
    const { c: maxCol, r: maxRow } = endRange

    const columns = generateExcelColumnConfig(worksheet, maxCol)
    const mergeMap = createMergeMap(merges)

    for (let r = 0; r <= maxRow; r++) {
      const row: ExcelRow = {}
      for (let c = 0; c <= maxCol; c++) {
        row[`col_${c}`] = processCellData(worksheet, r, c, mergeMap)
      }
      rows.push(row)
    }

    return { data: rows, columns }
  }

  // 文件处理函数
  const validateAndFormatUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return window.location.origin + url
    return new URL(url, window.location.href).href
  }

  const checkFileExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  const loadFromUrl = async (url: string) => {
    try {
      const formattedUrl = validateAndFormatUrl(url)

      if (!(await checkFileExists(formattedUrl))) {
        throw new Error(`文件不存在或无法访问: ${url}`)
      }

      if (fileType.value === 'pdf') {
        pdfUrl.value =
          formattedUrl + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH'
        totalPages.value = 1
        return
      }

      const response = await fetch(formattedUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const file = new File([blob], fileName.value, { type: blob.type })
      await loadFromFile(file)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误'
      throw new Error(`文件加载失败: ${errorMsg}`)
    }
  }

  const clearState = () => {
    Object.assign(
      {
        error: '',
        loading: false,
        pdfUrl: '',
        wordContent: '',
        activeSheet: '',
        currentPage: 1,
        totalPages: 0,
        scale: 1,
        wordZoom: 100,
      },
      {
        error,
        loading,
        pdfUrl,
        wordContent,
        activeSheet,
        currentPage,
        totalPages,
        scale,
        wordZoom,
      }
    )

    excelSheets.value = []
    excelData.value = []
    excelMerges.value = []
    headings.value = []
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
    loading.value = false
  }

  const loadPdf = async (file: File) => {
    if (
      !file.type.includes('pdf') &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      throw new Error('文件格式不是PDF')
    }

    const fileUrl = URL.createObjectURL(file)
    pdfUrl.value = fileUrl + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH'
    totalPages.value = 1
  }

  const loadWord = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({
        arrayBuffer,
        // 修复类型问题：使用 any 类型避免 styleMap 类型错误
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Title'] => h1.title:fresh",
        ],
      } as any)

      wordContent.value = result.value
      await nextTick()
      extractHeadings()
    } catch {
      throw new Error('Word文件加载失败')
    }
  }

  const extractHeadings = () => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = wordContent.value

    const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.value = Array.from(headingElements).map((el, index) => {
      const id = `heading-${index}`
      const level = parseInt(el.tagName.charAt(1))
      const text = el.textContent || ''

      wordContent.value = wordContent.value.replace(
        el.outerHTML,
        el.outerHTML.replace(
          el.tagName.toLowerCase(),
          `${el.tagName.toLowerCase()} id="${id}"`
        )
      )

      return { id, text, level }
    })
  }

  const loadExcel = async (file: File) => {
    try {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]
      const validExtensions = ['.xls', '.xlsx']
      const hasValidType =
        validTypes.includes(file.type) ||
        validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

      if (!hasValidType) {
        throw new Error('文件格式不是Excel格式')
      }

      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, {
        type: 'array',
        cellStyles: true,
        cellFormula: true,
        cellDates: true,
      })

      if (!workbook.SheetNames.length) {
        throw new Error('Excel文件中没有找到工作表')
      }

      excelSheets.value = workbook.SheetNames.map(name => {
        const worksheet = workbook.Sheets[name]
        const merges = worksheet['!merges'] || []
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')
        const { data, columns } = processExcelDataWithMerges(
          worksheet,
          range,
          merges
        )

        return { name, data, merges, columns }
      })

      if (excelSheets.value.length > 0) {
        const [currentSheet] = excelSheets.value
        const { name, data, merges, columns } = currentSheet

        activeSheet.value = name
        excelData.value = data
        excelMerges.value = merges
        excelColumns.value = columns
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '文件可能已损坏'
      throw new Error('Excel文件加载失败: ' + errorMessage)
    }
  }

  const loadFromFile = async (file: File) => {
    const loaders = {
      pdf: loadPdf,
      word: loadWord,
      excel: loadExcel,
    }

    const loader = loaders[fileType.value as keyof typeof loaders]
    if (!loader) {
      throw new Error('不支持的文件格式')
    }

    await loader(file)
  }

  const loadFile = async () => {
    if (!props.file && !props.url) {
      setError('未提供文件或URL')
      return
    }

    clearState()
    loading.value = true

    try {
      if (props.file) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, type, size } = props.file
        fileType.value = getFileType(name)
        fileSize.value = size

        if (fileType.value === 'unknown') {
          throw new Error('不支持的文件格式')
        }

        await loadFromFile(props.file)
      } else if (props.url) {
        fileType.value = getFileType(fileName.value)

        if (fileType.value === 'unknown') {
          throw new Error('无法识别文件格式，请检查文件扩展名')
        }

        await loadFromUrl(props.url)
      }

      loading.value = false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(`${fileType.value.toUpperCase()}文件加载失败: ${errorMessage}`)
    }
  }

  const downloadFile = () => {
    if (props.file) {
      const url = URL.createObjectURL(props.file)
      const a = document.createElement('a')
      Object.assign(a, {
        href: url,
        download: fileName.value,
      })
      a.click()
      URL.revokeObjectURL(url)
    } else if (props.url) {
      window.open(props.url, '_blank')
    }
  }

  const refreshPreview = () => loadFile()

  // 监听器
  watch(activeSheet, newSheet => {
    const sheet = excelSheets.value.find(s => s.name === newSheet)
    if (sheet) {
      const { data, merges, columns } = sheet
      excelData.value = data
      excelMerges.value = merges
      excelColumns.value = columns
      currentExcelPage.value = 1
    }
  })

  watch(
    () => [props.file, props.url],
    () => (props.file || props.url) && loadFile(),
    { immediate: true }
  )

  onMounted(() => {
    if (props.file || props.url) loadFile()
  })

  onUnmounted(() => {
    if (pdfUrl.value && pdfUrl.value.startsWith('blob:')) {
      const [blobUrl] = pdfUrl.value.split('#')
      URL.revokeObjectURL(blobUrl)
    }
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
