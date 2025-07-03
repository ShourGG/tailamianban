<template>
  <div class="workflow-page">
    <div class="page-header">
      <h2>审批流设计器</h2>
      <p>拖拽添加节点，设置审批人员，构建你的审批流程</p>
    </div>

    <!-- 工作流组件 -->
    <div class="workflow-container">
      <C_WorkFlow
        v-model="workflowData"
        :users="userList"
        :roles="roleList"
        :departments="deptList"
        @change="handleWorkflowChange"
        @node-click="handleNodeClick"
      />
    </div>

    <!-- 数据预览区 -->
    <div class="data-preview">
      <NCard
        title="当前工作流数据"
        size="small"
      >
        <template #header-extra>
          <NSpace>
            <NButton
              size="small"
              @click="saveWorkflow"
              >保存流程</NButton
            >
            <NButton
              size="small"
              @click="exportWorkflow"
              >导出数据</NButton
            >
            <NButton
              size="small"
              @click="clearWorkflow"
              >清空</NButton
            >
          </NSpace>
        </template>

        <NTabs
          type="line"
          size="small"
        >
          <NTabPane
            name="preview"
            tab="可视化预览"
          >
            <div class="workflow-preview">
              <div v-if="workflowData?.nodes?.length > 0">
                <div
                  v-for="node in workflowData.nodes"
                  :key="node.id"
                  class="node-info"
                >
                  <NBadge
                    :value="getNodeStatusText(node.data?.status)"
                    :type="getNodeStatusType(node.data?.status)"
                  >
                    <NTag>{{ node.data?.title }}</NTag>
                  </NBadge>
                  <span
                    v-if="node.data?.approvers?.length"
                    class="approvers"
                  >
                    ({{
                      node.data.approvers.map((u: User) => u.name).join(', ')
                    }})
                  </span>
                </div>
              </div>
              <NEmpty
                v-else
                description="暂无流程数据"
              />
            </div>
          </NTabPane>

          <NTabPane
            name="json"
            tab="JSON数据"
          >
            <NCode
              :code="JSON.stringify(workflowData, null, 2)"
              language="json"
            />
          </NTabPane>
        </NTabs>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 类型定义
  interface User {
    id: string
    name: string
    avatar?: string
    department: string
    role: string
    email?: string
    phone?: string
  }

  interface Role {
    id: string
    name: string
    description?: string
    level?: number
  }

  interface Department {
    id: string
    name: string
    parentId?: string
    manager?: string
  }

  // 消息提示
  const message = useMessage()

  // 响应式数据
  const workflowData = ref()

  // 完整的用户数据
  const userList = ref<User[]>([
    {
      id: '1',
      name: '张三',
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      department: '技术部',
      role: '前端工程师',
      email: 'zhangsan@company.com',
      phone: '13800138001',
    },
    {
      id: '2',
      name: '李四',
      avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
      department: '技术部',
      role: '后端工程师',
      email: 'lisi@company.com',
      phone: '13800138002',
    },
    {
      id: '3',
      name: '王五',
      avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
      department: '产品部',
      role: '产品经理',
      email: 'wangwu@company.com',
      phone: '13800138003',
    },
    {
      id: '4',
      name: '赵六',
      avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
      department: '技术部',
      role: '技术总监',
      email: 'zhaoliu@company.com',
      phone: '13800138004',
    },
    {
      id: '5',
      name: '钱七',
      avatar: 'https://avatars.githubusercontent.com/u/5?v=4',
      department: '人事部',
      role: 'HR经理',
      email: 'qianqi@company.com',
      phone: '13800138005',
    },
    {
      id: '6',
      name: '孙八',
      avatar: 'https://avatars.githubusercontent.com/u/6?v=4',
      department: '财务部',
      role: '财务经理',
      email: 'sunba@company.com',
      phone: '13800138006',
    },
    {
      id: '7',
      name: '周九',
      avatar: 'https://avatars.githubusercontent.com/u/7?v=4',
      department: '设计部',
      role: 'UI设计师',
      email: 'zhoujiu@company.com',
      phone: '13800138007',
    },
    {
      id: '8',
      name: '吴十',
      avatar: 'https://avatars.githubusercontent.com/u/8?v=4',
      department: '运营部',
      role: '运营专员',
      email: 'wushi@company.com',
      phone: '13800138008',
    },
    {
      id: '9',
      name: '郑十一',
      avatar: 'https://avatars.githubusercontent.com/u/9?v=4',
      department: '产品部',
      role: '产品总监',
      email: 'zhengshiyi@company.com',
      phone: '13800138009',
    },
    {
      id: '10',
      name: '陈十二',
      avatar: 'https://avatars.githubusercontent.com/u/10?v=4',
      department: '销售部',
      role: '销售经理',
      email: 'chenshier@company.com',
      phone: '13800138010',
    },
  ])

  // 角色数据
  const roleList = ref<Role[]>([
    {
      id: '1',
      name: '实习生',
      description: '公司实习生',
      level: 1,
    },
    {
      id: '2',
      name: '初级工程师',
      description: '1-2年工作经验',
      level: 2,
    },
    {
      id: '3',
      name: '中级工程师',
      description: '2-5年工作经验',
      level: 3,
    },
    {
      id: '4',
      name: '高级工程师',
      description: '5-8年工作经验',
      level: 4,
    },
    {
      id: '5',
      name: '技术专家',
      description: '8年以上工作经验',
      level: 5,
    },
    {
      id: '6',
      name: '项目经理',
      description: '负责项目管理',
      level: 4,
    },
    {
      id: '7',
      name: '产品经理',
      description: '负责产品规划',
      level: 4,
    },
    {
      id: '8',
      name: '部门经理',
      description: '部门管理者',
      level: 5,
    },
    {
      id: '9',
      name: '技术总监',
      description: '技术部门负责人',
      level: 6,
    },
    {
      id: '10',
      name: '产品总监',
      description: '产品部门负责人',
      level: 6,
    },
  ])

  // 部门数据
  const deptList = ref<Department[]>([
    {
      id: '1',
      name: '技术部',
      manager: '赵六',
    },
    {
      id: '2',
      name: '产品部',
      manager: '郑十一',
    },
    {
      id: '3',
      name: '设计部',
      manager: '周九',
    },
    {
      id: '4',
      name: '人事部',
      manager: '钱七',
    },
    {
      id: '5',
      name: '财务部',
      manager: '孙八',
    },
    {
      id: '6',
      name: '运营部',
      manager: '吴十',
    },
    {
      id: '7',
      name: '销售部',
      manager: '陈十二',
    },
    {
      id: '8',
      name: '前端组',
      parentId: '1',
      manager: '张三',
    },
    {
      id: '9',
      name: '后端组',
      parentId: '1',
      manager: '李四',
    },
    {
      id: '10',
      name: '测试组',
      parentId: '1',
    },
  ])

  // 事件处理
  const handleWorkflowChange = (data: any) => {
    console.log('工作流变化:', data)
    workflowData.value = data
    message.success('工作流已更新')
  }

  const handleNodeClick = (nodeData: any) => {
    console.log('节点点击:', nodeData)
    message.info(`点击了节点: ${nodeData.data?.title}`)
  }

  // 工具栏操作
  const saveWorkflow = () => {
    if (!workflowData.value) {
      message.warning('暂无工作流数据')
      return
    }

    // 模拟保存到后端
    console.log('保存工作流:', workflowData.value)
    message.success('工作流保存成功')
  }

  const exportWorkflow = () => {
    if (!workflowData.value) {
      message.warning('暂无工作流数据')
      return
    }

    // 导出JSON文件
    const dataStr = JSON.stringify(workflowData.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `workflow-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    message.success('工作流导出成功')
  }

  const clearWorkflow = () => {
    workflowData.value = null
    message.info('工作流已清空')
  }

  // 辅助函数
  const getNodeStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      pending: '待处理',
      approved: '已通过',
      rejected: '已拒绝',
      active: '进行中',
    }
    return statusMap[status || 'pending'] || '未知'
  }

  const getNodeStatusType = (status?: string) => {
    const typeMap: Record<string, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      active: 'info',
    }
    return typeMap[status || 'pending'] || 'default'
  }
</script>

<style scoped lang="scss">
  .workflow-page {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px 0;
      color: #262626;
      font-size: 24px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #8c8c8c;
      font-size: 14px;
    }
  }

  .workflow-container {
    margin-bottom: 24px;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .data-preview {
    .workflow-preview {
      min-height: 100px;

      .node-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .approvers {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .workflow-page {
      padding: 12px;
    }

    .page-header {
      h2 {
        font-size: 20px;
      }
    }
  }
</style>
