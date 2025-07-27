// 文件预览组件数据配置
export interface FileTypeConfig {
  tagType: string
  icon: string
}

export interface ExcelValidation {
  types: string[]
  extensions: string[]
}

// 文件类型映射
export const FILE_TYPE_MAP: Record<string, string> = {
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
}

// 文件配置
export const FILE_CONFIGS: Record<string, FileTypeConfig> = {
  pdf: {
    tagType: 'error',
    icon: 'ic:outline-picture-as-pdf',
  },
  word: {
    tagType: 'info',
    icon: 'ic:outline-description',
  },
  excel: {
    tagType: 'success',
    icon: 'ic:outline-grid-on',
  },
  unknown: {
    tagType: 'default',
    icon: 'ic:outline-insert-drive-file',
  },
}

// 文件大小单位
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB']

// 缩放配置
export const ZOOM_LIMITS = {
  pdf: {
    min: 0.5,
    max: 3,
    step: 0.25,
    default: 1,
  },
  word: {
    min: 50,
    max: 200,
    step: 10,
    default: 100,
  },
}

// Excel相关配置
export const EXCEL_CONFIG = {
  validation: {
    types: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    extensions: ['.xls', '.xlsx'],
  },
  pagination: {
    defaultPageSize: 50,
    pageSizeOptions: [20, 50, 100, 200],
  },
  columnWidth: {
    numeric: 45,
    minWidth: 80,
    maxWidth: 200,
    descriptionMinWidth: 120,
    multiplier: {
      default: 12,
      description: 14,
    },
  },
}

// Word相关配置
export const WORD_CONFIG = {
  styleMap: [
    "p[style-name='Heading 1'] => h1:fresh",
    "p[style-name='Heading 2'] => h2:fresh",
    "p[style-name='Heading 3'] => h3:fresh",
    "p[style-name='Title'] => h1.title:fresh",
  ],
  outline: {
    defaultShow: true,
    width: 280,
  },
}

// PDF相关配置
export const PDF_CONFIG = {
  urlParams: '#toolbar=1&navpanes=1&scrollbar=1&view=FitH',
  defaultPages: 1,
}

// 单元格类型映射
export const CELL_TYPE_PATTERNS = {
  gantt: /[■▬▪▫─━]/,
  date: [/^\d{4}[-/]\d{2}[-/]\d{2}/, /^\d{2}[-/]\d{2}[-/]\d{4}/],
  boolean: ['true', 'false'],
  number: {
    maxLength: 15,
  },
  longText: {
    threshold: 20,
  },
}

// 单元格样式类映射
export const CELL_CLASS_MAP = {
  empty: 'cell-empty',
  number: 'cell-number',
  gantt: 'cell-gantt',
  date: 'cell-date',
  boolean: 'cell-boolean',
  text: 'cell-text',
  longText: 'cell-text cell-long',
  merged: 'merged-cell',
  compact: 'compact-cell',
}

// 错误消息配置
export const ERROR_MESSAGES = {
  noFileOrUrl: '未提供文件或URL',
  unsupportedFormat: '不支持的文件格式',
  invalidFormat: '无法识别文件格式，请检查文件扩展名',
  fileNotFound: (url: string) => `文件不存在或无法访问: ${url}`,
  httpError: (status: number, statusText: string) =>
    `HTTP ${status}: ${statusText}`,
  loadFailed: (message: string) => `文件加载失败: ${message}`,
  pdf: {
    invalidFormat: '文件格式不是PDF',
    displayError: 'PDF文件无法显示，可能是文件损坏或浏览器不支持',
  },
  word: {
    loadFailed: 'Word文件加载失败',
  },
  excel: {
    invalidFormat: '文件格式不是Excel格式',
    noSheets: 'Excel文件中没有找到工作表',
    loadFailed: 'Excel文件加载失败',
    corrupted: '文件可能已损坏',
  },
}

// 调试信息标签
export const DEBUG_LABELS = {
  fileName: '文件名',
  fileType: '文件类型',
  fileSize: '文件大小',
  originalUrl: '原始URL',
  processedUrl: '处理后URL',
  browser: '浏览器',
  errorInfo: '错误信息',
}

// 工具提示文本
export const TOOLTIP_TEXTS = {
  filePathSolution: '📁 文件路径问题解决方案',
  checkList: '请检查',
  suggestedPaths: '建议路径格式',
  debugInfo: '查看详细调试信息',
  checkItems: [
    '文件是否真实存在于服务器上',
    '文件路径是否正确（区分大小写）',
    '服务器是否允许访问该目录',
    '文件权限是否正确设置',
  ],
  pathExamples: [
    '/public/files/sample.xlsx',
    'https://example.com/files/sample.xlsx',
    './assets/sample.xlsx',
  ],
}

// Excel表格相关文本
export const EXCEL_TEXTS = {
  currentSheet: '当前工作表',
  totalRows: '总行数',
  totalColumns: '总列数',
  currentPage: '当前页',
  rowNumber: '行号',
  emptySheetDescription: '该工作表没有数据或解析失败',
  reparse: '重新解析',
  compactView: '紧凑视图',
  fullFormat: '完整格式',
}

// 按钮文本
export const BUTTON_TEXTS = {
  download: '下载',
  refresh: '刷新',
  retry: '重试',
  clear: '清除',
  prev: '上一页',
  next: '下一页',
  zoomIn: '放大',
  zoomOut: '缩小',
  fit: '适应',
  reset: '重置',
  showOutline: '显示',
  hideOutline: '隐藏',
  outline: '目录',
}
