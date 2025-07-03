/**
 * 工作流相关类型定义
 */

// 基础用户类型
export interface User {
  id: string
  name: string
  avatar?: string
  department: string
  role: string
  email?: string
  phone?: string
}

// 角色类型
export interface Role {
  id: string
  name: string
  description?: string
  level?: number
}

// 部门类型
export interface Department {
  id: string
  name: string
  parentId?: string
  manager?: string
}

// 条件类型
export interface Condition {
  id: string
  name: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: string
}

// 节点状态类型
export type NodeStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'completed'

// 节点类型
export type NodeType = 'start' | 'approval' | 'copy' | 'condition'

// 审批模式类型
export type ApprovalMode = 'any' | 'all' | 'sequence'

// 节点数据基础接口
export interface BaseNodeData {
  title: string
  status?: NodeStatus
  config?: Record<string, any>
}

// 开始节点数据
export interface StartNodeData extends BaseNodeData {
  title: string
  status: 'active'
}

// 审批节点数据
export interface ApprovalNodeData extends BaseNodeData {
  approvers?: User[]
  approvalMode?: ApprovalMode
}

// 抄送节点数据
export interface CopyNodeData extends BaseNodeData {
  copyUsers?: User[]
}

// 条件节点数据
export interface ConditionNodeData extends BaseNodeData {
  conditions?: Condition[]
}

// 联合节点数据类型
export type NodeData =
  | StartNodeData
  | ApprovalNodeData
  | CopyNodeData
  | ConditionNodeData

// 工作流节点接口
export interface WorkflowNode {
  id: string
  type: NodeType
  position: {
    x: number
    y: number
  }
  data: NodeData
}

// 工作流边接口
export interface WorkflowEdge {
  id: string
  source: string
  target: string
  type?: string
  animated?: boolean
  label?: string
}

// 工作流数据接口
export interface WorkflowData {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  config?: {
    title?: string
    description?: string
    version?: string
    createdAt?: string
    updatedAt?: string
  }
}

// 组件Props接口
export interface WorkflowProps {
  users?: User[]
  roles?: Role[]
  departments?: Department[]
  modelValue?: WorkflowData
  readonly?: boolean
  theme?: 'light' | 'dark'
}

// 组件Emits接口
export interface WorkflowEmits {
  'update:modelValue': [value: WorkflowData]
  change: [value: WorkflowData]
  'node-click': [node: WorkflowNode]
  'edge-click': [edge: WorkflowEdge]
  save: [data: WorkflowData]
  'validate-error': [errors: ValidationError[]]
}

// 验证错误接口
export interface ValidationError {
  nodeId: string
  nodeName: string
  field: string
  message: string
  type: 'required' | 'invalid' | 'custom'
}

// 菜单位置接口
export interface MenuPosition {
  x: number
  y: number
}

// 节点配置表单数据接口
export interface NodeConfigFormData {
  approval?: {
    selectedUsers: string[]
    approvalMode: ApprovalMode
  }
  copy?: {
    selectedUsers: string[]
  }
  condition?: {
    conditions: Condition[]
  }
}

// Vue Flow 扩展类型
declare module '@vue-flow/core' {
  interface Node {
    id: string
    type: string
    position: { x: number; y: number }
    data: any
  }

  interface Edge {
    id: string
    source: string
    target: string
    type?: string
    animated?: boolean
  }
}

// 工具函数类型
export interface WorkflowUtils {
  validateWorkflow: (data: WorkflowData) => ValidationError[]
  exportWorkflow: (data: WorkflowData) => string
  importWorkflow: (jsonStr: string) => WorkflowData
  generateNodeId: (type: NodeType) => string
  generateEdgeId: (sourceId: string, targetId: string) => string
}
