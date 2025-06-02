<template>
  <div class="tech-profile-page">
    <!-- 个人栏 -->
    <div class="profile-header">
      <div class="profile-info">
        <NAvatar
          :size="60"
          round
          src="/robot-avatar.png"
        />
        <div class="user-info">
          <div class="name-row">
            <h2>CHENY</h2>
            <NTag
              type="success"
              size="small"
              round
            >
              <template #icon><i class="i-carbon-dot-mark" /></template>
              Creator
            </NTag>
          </div>
          <p class="intro">一只小趴菜 | 🐔🐤🐓 菜鸡互啄</p>
          <p class="id-info"
            >The following are the technical application scenarios and dependent
            versions used in the project...</p
          >
        </div>
      </div>
      <div class="profile-status">
        <span class="status-text">活跃 / 稳定</span>
      </div>
    </div>

    <!-- 项目概览 -->
    <div class="section-header">
      <span class="section-title">技术选型</span>
      <NInput
        v-model:value="searchText"
        placeholder="搜索项目…"
        size="small"
        class="project-search"
      />
    </div>

    <!-- 卡片区 -->
    <div class="cards-grid">
      <div
        v-for="project in filteredProjects"
        :key="project.name"
        class="card"
        @click="openModal(project)"
      >
        <div class="icon">
          <i :class="project.icon"></i>
          <NImage
            width="100"
            :src="useImage('notData')"
            preview-disabled
          />
        </div>
        <div class="info">
          <span class="title">{{ project.name }}</span>
          <span class="owner">{{ project.owner }}</span>
        </div>
        <NTag
          :type="getStatusType(project.status ?? '')"
          size="tiny"
          round
          class="status-tag"
        >
          {{ project.status }}
        </NTag>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <div class="table-block">
        <div class="table-title">生产依赖</div>
        <NDataTable
          :columns="projectColumns"
          :data="projectTable"
          size="small"
          :bordered="false"
          striped
          :row-props="createRowProps"
        />
      </div>

      <div class="table-block">
        <div class="table-title">开发依赖</div>
        <NDataTable
          :columns="taskColumns"
          :data="taskTable"
          size="small"
          :bordered="false"
          striped
          :row-props="createRowProps"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <NModal
      v-model:show="showModal"
      preset="card"
      :style="{ width: '420px' }"
      :bordered="false"
      class="detail-modal"
      :mask-closable="true"
    >
      <template #header>
        <div class="modal-header">
          <div class="modal-icon">
            <i :class="currentItem.icon || 'i-carbon-app'"></i>
          </div>
          <div class="modal-title-block">
            <span class="modal-title">{{ currentItem.name }}</span>
            <NTag
              :type="
                getStatusType(currentItem.status || currentItem.version || '')
              "
              size="small"
              round
            >
              {{ currentItem.status || currentItem.version }}
            </NTag>
          </div>
        </div>
      </template>

      <div class="modal-content">
        <div class="modal-item">
          <span class="label">包名：</span>
          <span class="text">{{ currentItem.owner }}</span>
        </div>
        <div class="modal-item">
          <span class="label">应用场景：</span>
          <span class="text">{{ currentItem.desc }}</span>
        </div>
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import {
    NTag,
    type DataTableColumns,
    type DataTableRowData,
    useThemeVars,
  } from 'naive-ui/es'

  import { useImage } from '@/hooks/useImage'

  // 获取 Naive UI 的主题变量
  const themeVars = useThemeVars()

  // 类型定义
  interface ProjectItem {
    name: string
    owner: string
    desc: string
    status?: string
    version?: string
    icon: string
  }

  type StatusType = 'success' | 'info' | 'warning' | 'error'

  // 响应式数据
  const searchText = ref('')
  const showModal = ref(false)
  const currentItem = ref<ProjectItem>({
    name: '',
    owner: '',
    desc: '',
    icon: '',
  })

  // 静态数据
  const projects: ProjectItem[] = [
    {
      name: 'Vue',
      owner: '张三',
      desc: '前端开发项目',
      status: '^3.5.13',
      icon: 'i-carbon-code',
    },
    {
      name: 'Backend',
      owner: '李四',
      desc: '后端API开发',
      status: '在线',
      icon: 'i-carbon-cloud-service',
    },
    {
      name: 'Database',
      owner: '王五',
      desc: '数据库设计',
      status: '离线',
      icon: 'i-carbon-data-base',
    },
    {
      name: 'Mobile App',
      owner: '赵六',
      desc: '移动App开发',
      status: '在线',
      icon: 'i-carbon-mobile',
    },
    {
      name: 'DevOps',
      owner: '孙七',
      desc: '运维部署任务',
      status: '离线',
      icon: 'i-carbon-deploy',
    },
    {
      name: 'Testing',
      owner: '周八',
      desc: '测试自动化',
      status: '在线',
      icon: 'i-carbon-test-tool',
    },
    {
      name: 'Analytics',
      owner: '吴九',
      desc: '数据分析',
      status: '在线',
      icon: 'i-carbon-analytics',
    },
    {
      name: 'Security',
      owner: '郑十',
      desc: '安全防护',
      status: '离线',
      icon: 'i-carbon-security',
    },
    {
      name: 'AI/ML',
      owner: '冯一',
      desc: '机器学习',
      status: '在线',
      icon: 'i-carbon-machine-learning',
    },
    {
      name: 'Design',
      owner: '陈二',
      desc: 'UI/UX设计',
      status: '在线',
      icon: 'i-carbon-design',
    },
  ]

  const projectTable: ProjectItem[] = [
    {
      name: 'Echarts',
      owner: '图表库，解决图表的快速搭建',
      version: 'v1.0.0',
      desc: '大型电商平台，支持多终端',
      icon: 'i-mdi:chart-bubble',
    },
  ]

  const taskTable: ProjectItem[] = [
    {
      name: 'console',
      owner: '调试打印库',
      status: '',
      desc: '提升界面美观度和易用性',
      icon: 'i-mdi:chart-bubble',
    },
  ]

  // 计算属性
  const filteredProjects = computed(() => {
    if (!searchText.value.trim()) return projects

    const keyword = searchText.value.toLowerCase().trim()
    return projects.filter(
      project =>
        project.name.toLowerCase().includes(keyword) ||
        project.owner.toLowerCase().includes(keyword) ||
        project.desc.toLowerCase().includes(keyword)
    )
  })

  const projectColumns: DataTableColumns<ProjectItem> = [
    { title: '包名', key: 'name', align: 'left' },
    { title: '应用场景', key: 'owner', align: 'left' },
    {
      title: '版本',
      key: 'version',
      align: 'center',
      render: (row: ProjectItem) =>
        h(
          NTag,
          {
            type: getStatusType(row.version || ''),
            size: 'small',
            round: true,
          },
          { default: () => row.version }
        ),
    },
  ]

  const taskColumns: DataTableColumns<ProjectItem> = [
    { title: '包名', key: 'name', align: 'left' },
    { title: '应用场景', key: 'owner', align: 'left' },
    {
      title: '版本',
      key: 'status',
      align: 'center',
      render: (row: ProjectItem) =>
        h(
          NTag,
          {
            type: getStatusType(row.status || ''),
            size: 'small',
            round: true,
          },
          { default: () => row.status }
        ),
    },
  ]

  /**
   * * @description: 工具函数
   * ? @param {*} status 状态
   * ! @return {*} {StatusType} 状态类型
   */
  function getStatusType(status: string): StatusType {
    const statusMap: Record<string, StatusType> = {
      在线: 'success',
      完成: 'success',
      已完成: 'success',
      离线: 'info',
      进行中: 'warning',
      暂停: 'warning',
      错误: 'error',
      失败: 'error',
    }
    return statusMap[status] || 'info'
  }

  /**
   * * @description: 创建行属性
   * ? @param {*} row 行数据
   * ! @return {*} {RowProps} 行属性
   */
  function createRowProps(row: DataTableRowData) {
    return {
      style: 'cursor: pointer;',
      onClick: () => openModal(row as ProjectItem),
    }
  }

  /**
   * * @description: 打开模态框
   * ? @param {*} item 项目数据
   * ! @return {*} {void}
   */
  function openModal(item: ProjectItem) {
    currentItem.value = { ...item }
    showModal.value = true
  }
</script>

<style scoped lang="scss">
  .tech-profile-page {
    min-height: 100vh;
    color: v-bind('themeVars.textColor1');
    transition: all 0.3s ease;
  }

  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: 82px;
    background: v-bind('themeVars.cardColor');
    border-bottom: 1px solid v-bind('themeVars.dividerColor');
    transition: all 0.3s ease;

    .profile-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .user-info {
        .name-row {
          display: flex;
          align-items: center;
          gap: 10px;

          h2 {
            font-size: 21px;
            font-weight: 600;
            margin: 0;
            color: v-bind('themeVars.textColor1');
            transition: color 0.3s ease;
          }
        }

        .intro {
          color: v-bind('themeVars.textColor2');
          font-size: 13px;
          margin: 0;
          transition: color 0.3s ease;
        }

        .id-info {
          color: v-bind('themeVars.textColor3');
          font-size: 11.5px;
          margin: 0;
          transition: color 0.3s ease;
        }
      }
    }

    .profile-status {
      .status-text {
        color: v-bind('themeVars.textColor1');
        font-size: 14px;
        font-weight: 600;
        padding: 8px 16px;
        background: v-bind('themeVars.buttonColor2');
        border-radius: 16px;
        transition: all 0.3s ease;
      }
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;

    .section-title {
      color: v-bind('themeVars.textColor1');
      font-size: 17px;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .project-search {
      min-width: 180px;
      width: 240px;
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;
    padding: 0 24px 24px 24px;

    .card {
      background: v-bind('themeVars.cardColor');
      border-radius: 16px;
      min-height: 92px;
      box-shadow: v-bind('themeVars.boxShadow1');
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 22px 14px;
      border: 1px solid v-bind('themeVars.borderColor');
      transition: all 0.18s ease;

      &:hover {
        transform: translateY(-7px) scale(1.04);
        box-shadow: v-bind('themeVars.boxShadow2');
        border-color: v-bind('themeVars.primaryColorHover');
      }

      .icon {
        width: 36px;
        height: 36px;
        background: v-bind('themeVars.actionColor');
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s ease;

        i {
          font-size: 20px;
          color: v-bind('themeVars.primaryColor');
          transition: color 0.3s ease;
        }
      }

      .info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .title {
          color: v-bind('themeVars.textColor1');
          font-size: 15px;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .owner {
          font-size: 12px;
          color: v-bind('themeVars.textColor2');
          transition: color 0.3s ease;
        }
      }

      .status-tag {
        margin-left: auto;
      }
    }
  }

  .table-area {
    display: flex;
    gap: 16px;
    padding: 0 24px 24px 24px;

    .table-block {
      flex: 1;
      background: v-bind('themeVars.cardColor');
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid v-bind('themeVars.borderColor');
      box-shadow: v-bind('themeVars.boxShadow1');
      transition: all 0.3s ease;

      .table-title {
        background: v-bind('themeVars.tableHeaderColor');
        color: v-bind('themeVars.textColor1');
        font-size: 15px;
        font-weight: 600;
        padding: 13px 18px;
        border-bottom: 1px solid v-bind('themeVars.dividerColor');
        transition: all 0.3s ease;
      }

      :deep(.n-data-table-th) {
        background: v-bind('themeVars.tableHeaderColor');
        color: v-bind('themeVars.textColor2');
        font-weight: 500;
        transition: all 0.3s ease;
      }

      :deep(.n-data-table-td) {
        font-size: 13px;
        color: v-bind('themeVars.textColor1');
        transition: color 0.3s ease;
      }

      :deep(.n-data-table-tr) {
        cursor: pointer;
        transition: background 0.16s ease;

        &:hover {
          background: v-bind('themeVars.hoverColor');
        }
      }
    }
  }

  .detail-modal {
    :deep(.n-card) {
      border-radius: 22px !important;
      background: v-bind('themeVars.modalColor') !important;
      box-shadow: v-bind('themeVars.boxShadow3') !important;
      transition: all 0.3s ease !important;
      border: 1px solid v-bind('themeVars.borderColor') !important;

      .n-card-header {
        border-bottom: none !important;
        background: transparent;
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 14px;

      .modal-icon {
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: v-bind('themeVars.actionColor');
        border-radius: 10px;
        transition: background-color 0.3s ease;

        i {
          font-size: 21px;
          color: v-bind('themeVars.primaryColor');
          transition: color 0.3s ease;
        }
      }

      .modal-title-block {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: v-bind('themeVars.textColor1');
          transition: color 0.3s ease;
        }
      }
    }

    .modal-content {
      .modal-item {
        margin-bottom: 10px;
        display: flex;
        align-items: center;

        .label {
          color: v-bind('themeVars.primaryColor');
          font-size: 14px;
          min-width: 56px;
          transition: color 0.3s ease;
        }

        .text {
          color: v-bind('themeVars.textColor1');
          font-size: 14px;
          transition: color 0.3s ease;
        }
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .cards-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: 968px) {
    .cards-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .table-area {
      flex-direction: column;
    }
  }

  @media (max-width: 768px) {
    .cards-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
</style>
