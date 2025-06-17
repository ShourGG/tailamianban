<template>
  <div class="demo-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>C_Table 动态行操作演示</h1>
      <p>展示 C_Table 集成动态行功能后的简化使用方式</p>
    </div>

    <!-- 主要功能卡片 -->
    <div class="main-card">
      <div class="card-header">
        <h2>员工信息管理</h2>
        <div class="header-actions">
          <button @click="resetData" class="btn-secondary">
            <i class="i-mdi:refresh"></i>
            重置数据
          </button>
          <button @click="exportData" class="btn-secondary">
            <i class="i-mdi:download"></i>
            导出数据
          </button>
          <button @click="toggleStats" class="btn-secondary">
            <i class="i-mdi:chart-line"></i>
            {{ showStats ? '隐藏' : '显示' }}统计
          </button>
        </div>
      </div>

      <!-- C_Table 组件 - 简化配置 -->
      <div ref="tableContainerRef" class="table-section">
        <!-- 表格水印背景 -->
        <div class="table-watermark">Robot Admin - 员工信息表</div>
        
        <C_Table
          ref="cTableRef"
          v-model:data="tableData"
          :columns="columns"
          :loading="loading"
          :row-key="rowKey"
          :editable="true"
          :edit-mode="'both'"
          :show-row-actions="true"
          :row-actions="customRowActions"
          :modal-title="'编辑员工信息'"
          :modal-width="700"
          :dynamic-rows-options="dynamicRowsConfig"
          @save="handleSave"
          @cancel="handleCancel"
          @row-add="handleRowAdd"
          @row-delete="handleRowDelete"
          @row-copy="handleRowCopy"
          @row-move="handleRowMove"
          @row-selection-change="handleRowSelectionChange"
        />
      </div>

      <!-- 选中行信息 -->
      <div v-if="selectedRowInfo" class="selected-info">
        <div class="alert alert-info">
          <div class="alert-content">
            <strong>当前选中：</strong>
            {{ selectedRowInfo.name }} - 
            {{ selectedRowInfo.department }} - 
            {{ selectedRowInfo.status === 'active' ? '活跃' : '非活跃' }}
          </div>
          <div class="selected-actions">
            <button @click="handleQuickEdit" class="btn-sm btn-primary">
              <i class="i-mdi:pencil"></i>
              快速编辑
            </button>
            <button @click="handlePrintTable" class="btn-sm btn-success">
              <i class="i-mdi:printer"></i>
              打印表格
            </button>
            <button @click="handleDownloadTable" class="btn-sm btn-success">
              <i class="i-mdi:download"></i>
              下载截图
            </button>
            <button @click="clearSelection" class="btn-sm btn-secondary">
              <i class="i-mdi:close"></i>
              取消选择
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div v-if="showStats" class="stats-card">
      <div class="card-header">
        <h3>数据统计</h3>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ tableData.length }}</div>
          <div class="stat-label">总员工数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ activeCount }}</div>
          <div class="stat-label">活跃员工</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ selectedRowInfo ? '1' : '0' }}</div>
          <div class="stat-label">选中行数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ operationLogs.length }}</div>
          <div class="stat-label">操作次数</div>
        </div>
      </div>

      <!-- 操作记录 -->
      <div class="operation-logs">
        <h4>操作记录</h4>
        <div class="logs-list">
          <div 
            v-for="(log, index) in operationLogs.slice(0, 6)" 
            :key="index"
            class="log-item"
          >
            <span class="log-type" :class="log.type">{{ log.type }}</span>
            <span class="log-message">{{ log.message }}</span>
            <span class="log-time">{{ log.time }}</span>
          </div>
          <div v-if="operationLogs.length === 0" class="empty-logs">
            暂无操作记录，试试表格上方的动态行操作按钮吧！
          </div>
        </div>
      </div>
    </div>

    <!-- 功能说明 -->
    <div class="feature-alert">
      <h3>C_Table 动态行功能说明</h3>
      <div class="feature-content">
        <div class="usage-example">
          <h4>简化后的使用方式</h4>
          <pre><code>&lt;C_Table
  v-model:data="tableData"
  :columns="columns"
  :dynamic-rows-options="{
    enableRadioSelection: true,
    enableAdd: true,
    enableDelete: true,
    enableMove: true,
    enablePrint: true,
    printWatermarkText: '我的表格',
    defaultRowData: () => ({ name: '新员工' })
  }"
  @row-add="handleRowAdd"
  @row-delete="handleRowDelete"
/&gt;</code></pre>
        </div>

        <div class="feature-grid">
          <div class="feature-item">
            <h4>配置对象属性</h4>
            <ul>
              <li><strong>enableRadioSelection:</strong> 启用单选功能</li>
              <li><strong>enableAdd/enableInsert:</strong> 启用增加/插入行</li>
              <li><strong>enableDelete/enableCopy:</strong> 启用删除/复制行</li>
              <li><strong>enableMove:</strong> 启用移动行</li>
              <li><strong>enablePrint:</strong> 启用打印功能</li>
              <li><strong>printWatermarkText:</strong> 打印水印文本</li>
            </ul>
          </div>

          <div class="feature-item">
            <h4>事件监听</h4>
            <ul>
              <li><strong>@row-add:</strong> 添加行事件</li>
              <li><strong>@row-delete:</strong> 删除行事件</li>
              <li><strong>@row-copy:</strong> 复制行事件</li>
              <li><strong>@row-move:</strong> 移动行事件</li>
              <li><strong>@row-selection-change:</strong> 选择变化事件</li>
            </ul>
          </div>

          <div class="feature-item">
            <h4>水印功能</h4>
            <ul>
              <li><strong>表格水印:</strong> 表格背景显示水印文字</li>
              <li><strong>打印水印:</strong> 打印时保留水印效果</li>
              <li><strong>防篡改:</strong> 增强表格数据安全性</li>
              <li><strong>自定义文本:</strong> 可配置水印内容</li>
            </ul>
          </div>

          <div class="feature-item">
            <h4>方法调用</h4>
            <ul>
              <li><strong>addRow():</strong> 编程式添加行</li>
              <li><strong>deleteRow():</strong> 编程式删除行</li>
              <li><strong>printTable():</strong> 编程式打印</li>
              <li><strong>downloadTableScreenshot():</strong> 下载截图</li>
              <li><strong>getSelectedRowData():</strong> 获取选中行</li>
            </ul>
          </div>
        </div>

        <div class="usage-tips">
          <h4>优化说明</h4>
          <ol>
            <li><strong>简化配置：</strong>使用单个 dynamic-rows-options 对象替代多个 enable-xxx props</li>
            <li><strong>减少代码：</strong>C_Table 内部处理所有动态行逻辑，使用者无需手动调用 Hook</li>
            <li><strong>保持原有功能：</strong>所有编辑、展开、选择功能都不受影响</li>
            <li><strong>向后兼容：</strong>不传 dynamic-rows-options 时功能完全不变</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import C_Table from '@/components/global/C_Table/index.vue'
import type { TableColumn, DataRecord, RowAction } from '@/types/modules/table'
import type { DynamicRowsOptions } from '@/composables/Table/useDynamicRow'

// 🔥 类型定义 - 继承 DataRecord 保证类型一致性
interface EmployeeData extends DataRecord {
  id: string
  name: string
  age: number
  email: string
  department: string
  status: 'active' | 'inactive'
  salary: number
  createTime: string
  description?: string
}

interface OperationLog {
  type: 'add' | 'delete' | 'copy' | 'move' | 'edit' | 'select'
  message: string
  time: string
}

// 🔥 C_Table 实例类型定义
interface CTableInstance {
  startEdit: (rowKey: string) => void
  clearRowSelection: () => void
  printTable: (elementRef: HTMLElement) => Promise<void>
  downloadTableScreenshot: (elementRef: HTMLElement, filename?: string) => Promise<void>
}

// 响应式数据
const message = useMessage()
const cTableRef = ref<CTableInstance>()
const tableContainerRef = ref<HTMLElement>()
const showStats = ref(true)
const loading = ref(false)
const operationLogs = ref<OperationLog[]>([])
const selectedRowInfo = ref<EmployeeData | null>(null)

// 初始数据
const initialData: EmployeeData[] = [
  {
    id: '1',
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com',
    department: '技术部',
    status: 'active',
    salary: 12000,
    createTime: '2023-12-01 10:30:00',
    description: '前端开发工程师'
  },
  {
    id: '2', 
    name: '李四',
    age: 28,
    email: 'lisi@example.com',
    department: '产品部',
    status: 'active',
    salary: 15000,
    createTime: '2023-12-02 14:20:00',
    description: '产品经理'
  },
  {
    id: '3',
    name: '王五',
    age: 30,
    email: 'wangwu@example.com',
    department: '设计部',
    status: 'inactive',
    salary: 10000,
    createTime: '2023-12-03 09:15:00',
    description: 'UI设计师'
  },
  {
    id: '4',
    name: '赵六',
    age: 26,
    email: 'zhaoliu@example.com',
    department: '运营部',
    status: 'active',
    salary: 9000,
    createTime: '2023-12-04 16:45:00',
    description: '运营专员'
  }
]

const tableData = ref<EmployeeData[]>([...initialData])

// 表格配置
const rowKey = (row: EmployeeData) => row.id

// 🔥 列配置 - 使用正确的类型约束
const columns: TableColumn<EmployeeData>[] = [
  {
    key: 'id',
    title: 'ID',
    width: 80,
    align: 'center',
    editable: false
  },
  {
    key: 'name',
    title: '姓名',
    width: 120,
    editable: true,
    editType: 'input',
    editProps: { placeholder: '请输入姓名' }
  },
  {
    key: 'age',
    title: '年龄',
    width: 80,
    align: 'center',
    editable: true,
    editType: 'number',
    editProps: { min: 18, max: 65 }
  },
  {
    key: 'email',
    title: '邮箱',
    width: 220,
    editable: true,
    editType: 'email',
    editProps: { placeholder: '请输入邮箱' }
  },
  {
    key: 'department',
    title: '部门',
    width: 120,
    align: 'center',
    editable: true,
    editType: 'select',
    editProps: {
      options: [
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '设计部', value: '设计部' },
        { label: '运营部', value: '运营部' }
      ]
    }
  },
  {
    key: 'salary',
    title: '薪资',
    width: 120,
    align: 'right',
    editable: true,
    editType: 'number',
    editProps: { min: 3000, max: 50000 },
    render: (rowData) => `¥${rowData.salary?.toLocaleString() || 0}`
  },
  {
    key: 'status',
    title: '状态',
    width: 100,
    align: 'center',
    editable: true,
    editType: 'select',
    editProps: {
      options: [
        { label: '活跃', value: 'active' },
        { label: '非活跃', value: 'inactive' }
      ]
    },
    render: (rowData) => rowData.status === 'active' ? '🟢 活跃' : '🔴 非活跃'
  },
  {
    key: 'createTime',
    title: '创建时间',
    width: 160,
    editable: false
  }
]

// 🔥 动态行配置 - 使用正确的类型约束
const dynamicRowsConfig: DynamicRowsOptions<EmployeeData> = {
  rowKey: 'id',
  enableRadioSelection: true,
  enableAdd: true,
  enableInsert: true,
  enableDelete: true,
  enableCopy: true,
  enableMove: true,
  enablePrint: true,
  confirmDelete: true,
  deleteConfirmText: '确定要删除选中的员工吗？此操作不可撤销。',
  printPreset: 'table',
  printWatermarkText: 'Robot Admin - 员工信息表',
  
  defaultRowData: (): EmployeeData => ({
    id: '',
    name: '新员工',
    age: 25,
    email: '',
    department: '技术部',
    status: 'active',
    salary: 8000,
    createTime: new Date().toLocaleString(),
    description: ''
  })
}

// 🔥 自定义行操作 - 使用正确的类型约束
const customRowActions: RowAction<EmployeeData>[] = [
  {
    label: '详情',
    icon: 'i-mdi:eye',
    type: 'info',
    onClick: (row: EmployeeData) => {
      message.info(`查看 ${row.name} 的详细信息`)
      addOperationLog('edit', `查看了员工 ${row.name} 的详情`)
    }
  }
]

// 计算属性
const activeCount = computed(() => 
  tableData.value.filter(emp => emp.status === 'active').length
)

// 方法
const addOperationLog = (type: OperationLog['type'], logMessage: string) => {
  operationLogs.value.unshift({
    type,
    message: logMessage,
    time: new Date().toLocaleTimeString()
  })
  
  if (operationLogs.value.length > 20) {
    operationLogs.value = operationLogs.value.slice(0, 20)
  }
}

// 🔥 C_Table 事件处理 - 修复类型问题
const handleSave = (rowData: EmployeeData) => {
  message.success(`保存成功: ${rowData.name}`)
  addOperationLog('edit', `编辑了员工 ${rowData.name} 的信息`)
}

const handleCancel = (rowData: EmployeeData) => {
  message.info(`取消编辑: ${rowData.name}`)
}

const handleRowAdd = (newRow: EmployeeData) => {
  message.success(`添加了新员工: ${newRow.name}`)
  addOperationLog('add', `添加了新员工: ${newRow.name}`)
}

const handleRowDelete = (deletedRow: EmployeeData) => {
  message.success(`删除了员工: ${deletedRow.name}`)
  addOperationLog('delete', `删除了员工: ${deletedRow.name}`)
}

const handleRowCopy = (originalRow: EmployeeData) => {
  message.success(`复制了员工: ${originalRow.name}`)
  addOperationLog('copy', `复制了员工: ${originalRow.name}`)
}

const handleRowMove = (row: EmployeeData, fromIndex: number, toIndex: number) => {
  const direction = toIndex > fromIndex ? '下移' : '上移'
  message.success(`${direction}了员工: ${row.name}`)
  addOperationLog('move', `${direction}了员工: ${row.name}`)
}

// 🔥 修复选择变化事件的类型参数
const handleRowSelectionChange = (selectedKey: string | null, selectedRow: EmployeeData | null) => {
  selectedRowInfo.value = selectedRow
  if (selectedRow) {
    addOperationLog('select', `选中了员工: ${selectedRow.name}`)
  }
}

// 页面操作方法
const resetData = () => {
  tableData.value = [...initialData]
  operationLogs.value = []
  selectedRowInfo.value = null
  if (cTableRef.value?.clearRowSelection) {
    cTableRef.value.clearRowSelection()
  }
  message.success('数据已重置')
}

const exportData = () => {
  const dataStr = JSON.stringify(tableData.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `员工信息表-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  message.success('数据导出成功')
}

const toggleStats = () => {
  showStats.value = !showStats.value
}

const handleQuickEdit = () => {
  if (selectedRowInfo.value && cTableRef.value?.startEdit) {
    const rowKey = selectedRowInfo.value.id
    cTableRef.value.startEdit(rowKey)
    addOperationLog('edit', `开始编辑员工: ${selectedRowInfo.value.name}`)
  }
}

// 🔥 修复打印和下载方法的类型检查
const handlePrintTable = async () => {
  if (cTableRef.value?.printTable && tableContainerRef.value) {
    try {
      await cTableRef.value.printTable(tableContainerRef.value)
      addOperationLog('edit', '打印了表格')
      message.success('打印任务已发送')
    } catch (error) {
      console.error('打印失败:', error)
      message.error('打印失败，请重试')
    }
  } else {
    message.warning('打印功能暂不可用')
  }
}

const handleDownloadTable = async () => {
  if (cTableRef.value?.downloadTableScreenshot && tableContainerRef.value) {
    try {
      const filename = `员工信息表-${new Date().toISOString().slice(0, 10)}`
      await cTableRef.value.downloadTableScreenshot(tableContainerRef.value, filename)
      addOperationLog('edit', '下载了表格截图')
      message.success('截图下载成功')
    } catch (error) {
      console.error('下载失败:', error)
      message.error('下载失败，请重试')
    }
  } else {
    message.warning('下载功能暂不可用')
  }
}

const clearSelection = () => {
  if (cTableRef.value?.clearRowSelection) {
    cTableRef.value.clearRowSelection()
  }
  selectedRowInfo.value = null
  message.info('已清空选择')
}
</script>

<style scoped lang="scss">
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 28px;
    color: #333;
    margin: 0 0 10px 0;
  }
  
  p {
    color: #666;
    margin: 0;
  }
}

.main-card, .stats-card, .feature-alert {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2, h3 {
    margin: 0;
    color: #333;
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
  }
}

.table-section {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;

  .table-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 48px;
    color: rgba(0, 0, 0, 0.05);
    font-weight: bold;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    user-select: none;
    font-family: 'Microsoft YaHei', sans-serif;
  }

  :deep(.c-table-wrapper) {
    position: relative;
    z-index: 1;
    background: rgba(255, 255, 255, 0.98);
  }

  // 确保表格内容有适当的背景透明度以显示水印
  :deep(.n-data-table) {
    background: rgba(255, 255, 255, 0.95);
  }
  
  :deep(.n-data-table-tbody) {
    background: rgba(255, 255, 255, 0.95);
  }
}

.selected-info {
  margin-top: 15px;
  
  .alert {
    padding: 12px 15px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &.alert-info {
      background: #e7f3ff;
      border: 1px solid #b3d9ff;
      color: #0066cc;
    }
  }
  
  .alert-content {
    flex: 1;
  }
  
  .selected-actions {
    display: flex;
    gap: 8px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
  
  .stat-label {
    font-size: 14px;
    color: #666;
    margin-top: 5px;
  }
}

.operation-logs {
  h4 {
    margin: 0 0 15px 0;
    color: #333;
  }
  
  .logs-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }
  
  .log-item {
    display: flex;
    gap: 10px;
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    
    &:last-child {
      border-bottom: none;
    }
    
    .log-type {
      background: #e0e0e0;
      color: #666;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      min-width: 50px;
      text-align: center;
      
      &.add { background: #d4edda; color: #155724; }
      &.delete { background: #f8d7da; color: #721c24; }
      &.copy { background: #d1ecf1; color: #0c5460; }
      &.move { background: #fff3cd; color: #856404; }
      &.edit { background: #e2e3e5; color: #383d41; }
      &.select { background: #cce5ff; color: #004085; }
    }
    
    .log-message {
      flex: 1;
      color: #333;
    }
    
    .log-time {
      color: #999;
      font-size: 12px;
    }
  }
  
  .empty-logs {
    padding: 20px;
    text-align: center;
    color: #999;
    font-style: italic;
  }
}

.feature-content {
  .usage-example {
    margin-bottom: 20px;
    
    h4 {
      color: #333;
      margin: 0 0 10px 0;
    }
    
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      
      code {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: #333;
      }
    }
  }
  
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .feature-item {
    h4 {
      color: #333;
      margin: 0 0 10px 0;
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 5px;
        line-height: 1.5;
        
        strong {
          color: #0066cc;
        }
      }
    }
  }
  
  .usage-tips {
    background: #f0f8ff;
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #cce5ff;
    
    h4 {
      margin: 0 0 10px 0;
      color: #0066cc;
    }
    
    ol {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 5px;
        line-height: 1.5;
      }
    }
  }
}

// 按钮样式
.btn-primary, .btn-secondary, .btn-success, .btn-sm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  i {
    font-size: 16px;
  }
}

.btn-sm {
  padding: 6px 10px;
  font-size: 12px;
  
  i {
    font-size: 14px;
  }
}

.btn-primary { background: #007bff; color: white; &:hover:not(:disabled) { background: #0056b3; } }
.btn-secondary { background: #6c757d; color: white; &:hover:not(:disabled) { background: #545b62; } }
.btn-success { background: #28a745; color: white; &:hover:not(:disabled) { background: #1e7e34; } }

// 响应式设计
@media (max-width: 768px) {
  .demo-container {
    padding: 15px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .selected-info .alert {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>