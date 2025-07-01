<template>
  <div class="permission-management">
    <!-- 搜索筛选区域 -->
    <NCard class="header-card">
      <NSpace
        justify="space-between"
        align="center"
      >
        <NSpace class="search-filters">
          <NInput
            v-model:value="searchForm.keyword"
            placeholder="搜索权限名称、编码、描述"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <C_Icon
                :name="ICONS.search"
                :size="16"
              />
            </template>
          </NInput>
          <NSelect
            v-model:value="searchForm.type"
            placeholder="权限类型"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.permissionType"
            @update:value="handleSearch"
          />
          <NSelect
            v-model:value="searchForm.module"
            placeholder="所属模块"
            clearable
            style="width: 120px"
            :options="SYSTEM_MODULES"
            @update:value="handleSearch"
          />
          <NSelect
            v-model:value="searchForm.status"
            placeholder="权限状态"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.permissionStatus"
            @update:value="handleSearch"
          />
        </NSpace>
        <NSpace>
          <NButton
            type="primary"
            @click="openPermissionModal()"
          >
            <template #icon>
              <C_Icon
                :name="ICONS.plus"
                :size="16"
              />
            </template>
            新增权限
          </NButton>
          <NButton
            @click="handleExport"
            :loading="exportLoading"
          >
            <template #icon>
              <C_Icon
                :name="ICONS.export"
                :size="16"
              />
            </template>
            导出
          </NButton>
          <NButton @click="refreshData">
            <template #icon>
              <C_Icon
                :name="ICONS.refresh"
                :size="16"
              />
            </template>
            刷新
          </NButton>
        </NSpace>
      </NSpace>
    </NCard>

    <!-- 统计卡片区域 - 可点击筛选 -->
    <NGrid
      :cols="4"
      :x-gap="16"
      class="stat-grid"
    >
      <NGi
        v-for="stat in permissionStats"
        :key="stat.type"
      >
        <NCard
          size="small"
          hoverable
          :class="{ 'stat-card-active': searchForm.type === stat.type }"
          class="stat-card-clickable"
          @click="handleStatCardClick(stat.type)"
        >
          <NSpace align="center">
            <div
              class="stat-icon"
              :style="{
                backgroundColor: stat.color,
                opacity: 0.2,
              }"
            >
              <C_Icon
                :name="stat.icon"
                :size="24"
                :style="{ color: stat.color }"
              />
            </div>
            <div class="stat-content">
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
          </NSpace>
        </NCard>
      </NGi>
    </NGrid>

    <!-- 筛选标签显示 -->
    <div
      class="filter-tags"
      v-if="hasActiveFilters"
    >
      <NSpace>
        <NText
          depth="3"
          style="margin-right: 8px"
          >当前筛选：</NText
        >
        <NTag
          v-if="searchForm.keyword"
          closable
          @close="
            searchForm.keyword = ''
            handleSearch()
          "
          type="info"
        >
          关键词: {{ searchForm.keyword }}
        </NTag>
        <NTag
          v-if="searchForm.type"
          closable
          @close="
            searchForm.type = null
            handleSearch()
          "
          type="success"
        >
          类型: {{ getTypeLabel(searchForm.type) }}
        </NTag>
        <NTag
          v-if="searchForm.module"
          closable
          @close="
            searchForm.module = null
            handleSearch()
          "
          type="warning"
        >
          模块: {{ getModuleName(searchForm.module) }}
        </NTag>
        <NTag
          v-if="searchForm.status !== null"
          closable
          @close="
            searchForm.status = null
            handleSearch()
          "
          :type="searchForm.status === 1 ? 'success' : 'error'"
        >
          状态: {{ searchForm.status === 1 ? '启用' : '禁用' }}
        </NTag>
        <NButton
          text
          size="small"
          @click="clearAllFilters"
          type="error"
        >
          清空筛选
        </NButton>
      </NSpace>
    </div>

    <!-- 主表格区域 -->
    <div class="main-content">
      <NCard class="content-card">
        <template #header>
          <NText>
            权限资源库
            <NTag
              type="info"
              size="small"
              style="margin-left: 8px"
            >
              {{ searchResultText }}
            </NTag>
          </NText>
        </template>

        <div class="table-container">
          <C_Table
            ref="tableRef"
            :columns="tableColumns"
            :data="filteredPermissionList"
            :loading="loading"
            :row-key="rowKey"
            :actions="tableActions"
            edit-mode="modal"
            modal-title="编辑权限"
            :modal-width="800"
            size="small"
            striped
            bordered
            single-line
            :scroll-x="1400"
            :max-height="500"
            @save="handleTableSave"
          />
        </div>
      </NCard>
    </div>

    <!-- 权限详情抽屉 -->
    <NDrawer
      v-model:show="showPermissionDetail"
      :width="600"
      placement="right"
    >
      <NDrawerContent
        title="权限详情"
        closable
      >
        <div
          class="permission-detail"
          v-if="currentPermission"
        >
          <NSpace
            vertical
            :size="24"
          >
            <!-- 基本信息 -->
            <NCard
              title="基本信息"
              size="small"
            >
              <NDescriptions
                :column="2"
                bordered
              >
                <NDescriptionsItem label="权限名称">
                  {{ currentPermission.name }}
                </NDescriptionsItem>
                <NDescriptionsItem label="权限编码">
                  <NTag
                    type="info"
                    size="small"
                    >{{ currentPermission.code }}</NTag
                  >
                </NDescriptionsItem>
                <NDescriptionsItem label="权限类型">
                  <NTag
                    :type="PERMISSION_TYPE_CONFIG[currentPermission.type].type"
                    size="small"
                  >
                    <template #icon>
                      <C_Icon
                        :name="
                          PERMISSION_TYPE_CONFIG[currentPermission.type].icon
                        "
                        :size="12"
                      />
                    </template>
                    {{ PERMISSION_TYPE_CONFIG[currentPermission.type].text }}
                  </NTag>
                </NDescriptionsItem>
                <NDescriptionsItem label="所属模块">
                  {{ getModuleName(currentPermission.module) }}
                </NDescriptionsItem>
                <NDescriptionsItem label="状态">
                  <NTag
                    :type="currentPermission.status === 1 ? 'success' : 'error'"
                    size="small"
                  >
                    {{ currentPermission.status === 1 ? '启用' : '禁用' }}
                  </NTag>
                </NDescriptionsItem>
                <NDescriptionsItem label="创建时间">
                  {{ currentPermission.createTime }}
                </NDescriptionsItem>
                <NDescriptionsItem
                  label="关联资源"
                  :span="2"
                  v-if="currentPermission.resources"
                >
                  {{ currentPermission.resources.join(', ') }}
                </NDescriptionsItem>
                <NDescriptionsItem
                  label="描述"
                  :span="2"
                  v-if="currentPermission.description"
                >
                  {{ currentPermission.description }}
                </NDescriptionsItem>
              </NDescriptions>
            </NCard>

            <!-- 权限说明 -->
            <NCard
              title="权限说明"
              size="small"
            >
              <NAlert
                type="info"
                :show-icon="false"
              >
                <template #header>
                  <NSpace align="center">
                    <C_Icon
                      :name="
                        PERMISSION_TYPE_CONFIG[currentPermission.type].icon
                      "
                      :size="16"
                    />
                    <span>{{
                      PERMISSION_TYPE_CONFIG[currentPermission.type].text
                    }}</span>
                  </NSpace>
                </template>
                {{ PERMISSION_TYPE_CONFIG[currentPermission.type].description }}
              </NAlert>
            </NCard>

            <!-- 使用说明 -->
            <NCard
              title="使用说明"
              size="small"
              v-if="currentPermission.type !== 'module'"
            >
              <div class="usage-guide">
                <div
                  class="guide-item"
                  v-if="currentPermission.type === 'button'"
                >
                  <div class="guide-title">按钮权限使用：</div>
                  <div class="guide-content">
                    在Vue组件中使用 hasPermission()
                    函数检查权限，控制按钮的显示与隐藏
                  </div>
                </div>
                <div
                  class="guide-item"
                  v-if="currentPermission.type === 'api'"
                >
                  <div class="guide-title">API权限使用：</div>
                  <div class="guide-content">
                    在后端接口上添加权限注解，如 @RequirePermission("{{
                      currentPermission.code
                    }}")
                  </div>
                </div>
                <div
                  class="guide-item"
                  v-if="currentPermission.type === 'function'"
                >
                  <div class="guide-title">功能权限使用：</div>
                  <div class="guide-content">
                    在路由守卫中检查用户是否具有该功能的访问权限
                  </div>
                </div>
              </div>
            </NCard>

            <!-- 备注信息 -->
            <NCard
              title="备注信息"
              size="small"
              v-if="currentPermission.remark"
            >
              <NText>{{ currentPermission.remark }}</NText>
            </NCard>
          </NSpace>
        </div>
      </NDrawerContent>
    </NDrawer>

    <!-- 新增/编辑权限模态框 -->
    <NModal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      :positive-text="modalMode === 'add' ? '确认添加' : '确认修改'"
      negative-text="取消"
      @positive-click="handleSavePermission"
      @negative-click="closePermissionModal"
      style="width: 700px"
    >
      <NForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
      >
        <NGrid
          :cols="2"
          :x-gap="16"
        >
          <NGi>
            <NFormItem
              label="权限名称"
              path="name"
            >
              <NInput
                v-model:value="formData.name"
                placeholder="请输入权限名称"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="权限类型"
              path="type"
            >
              <NSelect
                v-model:value="formData.type"
                :options="UI_CONFIG.permissionType"
                @update:value="handleTypeChange"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="所属模块"
              path="module"
            >
              <NSelect
                v-model:value="formData.module"
                :options="SYSTEM_MODULES"
                @update:value="handleModuleChange"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="排序"
              path="sort"
            >
              <NInputNumber
                v-model:value="formData.sort"
                :min="0"
                :max="9999"
                style="width: 100%"
              />
            </NFormItem>
          </NGi>
        </NGrid>

        <NFormItem
          label="权限编码"
          path="code"
        >
          <NInput
            v-model:value="formData.code"
            placeholder="自动生成或手动输入"
            :disabled="modalMode === 'edit'"
          >
            <template #suffix>
              <NButton
                text
                size="small"
                @click="generateCode"
                v-if="modalMode === 'add'"
              >
                <C_Icon
                  name="mdi:auto-fix"
                  :size="14"
                />
              </NButton>
            </template>
          </NInput>
        </NFormItem>

        <NFormItem
          label="关联资源"
          path="resources"
        >
          <NInput
            v-model:value="formData.resources"
            type="textarea"
            :rows="2"
            placeholder="请输入关联资源，多个用逗号分隔"
          />
          <template #feedback>
            <NText
              depth="3"
              style="font-size: 12px"
            >
              {{ getResourcePlaceholder(formData.type) }}
            </NText>
          </template>
        </NFormItem>

        <NFormItem
          label="权限描述"
          path="description"
        >
          <NInput
            v-model:value="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入权限描述"
          />
        </NFormItem>

        <NFormItem
          label="权限状态"
          path="status"
        >
          <NSwitch
            v-model:value="formData.status"
            :checked-value="1"
            :unchecked-value="0"
          >
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </NSwitch>
        </NFormItem>

        <NFormItem
          label="备注"
          path="remark"
        >
          <NInput
            v-model:value="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { FormInst } from 'naive-ui/es'
  import { h } from 'vue'
  import C_Icon from '@/components/global/C_Icon/index.vue'
  import C_Table from '@/components/global/C_Table/index.vue'
  import {
    type PermissionData,
    type PermissionFormData,
    type SearchForm,
    type PermissionType,
    PERMISSION_FORM_RULES,
    DEFAULT_PERMISSION_FORM_DATA,
    UI_CONFIG,
    ICONS,
    PERMISSION_TYPE_CONFIG,
    SYSTEM_MODULES,
    MOCK_PERMISSION_DATA,
    updatePermissionInList,
    removePermissionFromList,
    addPermissionToList,
    exportPermissionApi,
  } from './data'

  const message = useMessage()

  // ==================== 响应式数据 ====================
  const loading = ref(false)
  const exportLoading = ref(false)
  const showModal = ref(false)
  const showPermissionDetail = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInst | null>(null)
  const tableRef = ref()
  const currentPermission = ref<PermissionData | null>(null)

  const permissionList = reactive<PermissionData[]>([...MOCK_PERMISSION_DATA])
  const formData = reactive<PermissionFormData>({
    ...DEFAULT_PERMISSION_FORM_DATA,
  })
  const formRules = PERMISSION_FORM_RULES

  const searchForm = reactive<SearchForm>({
    keyword: '',
    status: null,
    type: null,
    module: null,
  })

  // ==================== 计算属性 ====================
  const modalTitle = computed(() =>
    modalMode.value === 'add' ? '新增权限' : '编辑权限'
  )

  // 检查是否有活跃的筛选条件
  const hasActiveFilters = computed(() => {
    return !!(
      searchForm.keyword ||
      searchForm.type ||
      searchForm.module ||
      searchForm.status !== null
    )
  })

  // 筛选后的权限列表
  const filteredPermissionList = computed(() => {
    let filtered = [...permissionList]

    if (searchForm.keyword) {
      const keyword = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(
        perm =>
          perm.name.toLowerCase().includes(keyword) ||
          perm.code.toLowerCase().includes(keyword) ||
          (perm.description && perm.description.toLowerCase().includes(keyword))
      )
    }

    if (searchForm.type) {
      filtered = filtered.filter(perm => perm.type === searchForm.type)
    }

    if (searchForm.module) {
      filtered = filtered.filter(perm => perm.module === searchForm.module)
    }

    if (searchForm.status !== null && searchForm.status !== undefined) {
      filtered = filtered.filter(perm => perm.status === searchForm.status)
    }

    return filtered
  })

  // 搜索结果文本
  const searchResultText = computed(() => {
    if (hasActiveFilters.value) {
      return `筛选出 ${filteredPermissionList.value.length} 个权限`
    }
    return `共 ${permissionList.length} 个权限`
  })

  const tableColumns = computed(() => [
    {
      key: 'name',
      title: '权限名称',
      width: 200,
      editable: true,
      required: true,
      render: (row: any) =>
        h(
          'span',
          {
            style: {
              textDecoration: row.status === 0 ? 'line-through' : 'none',
              opacity: row.status === 0 ? '0.6' : '1',
              color:
                row.status === 0
                  ? 'var(--n-text-color-disabled)'
                  : 'var(--n-text-color-base)',
            },
          },
          row.name
        ),
    },
    {
      key: 'code',
      title: '权限编码',
      width: 220,
      editable: false,
      render: (row: any) =>
        h(
          'code',
          {
            class: ['permission-code', { 'disabled-row': row.status === 0 }],
            style: {
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '12px',
              fontFamily: 'Monaco, monospace',
              textDecoration: row.status === 0 ? 'line-through' : 'none',
              opacity: row.status === 0 ? '0.6' : '1',
            },
          },
          row.code
        ),
    },
    {
      key: 'type',
      title: '权限类型',
      width: 120,
      editable: true,
      editType: 'select' as const,
      editOptions: UI_CONFIG.permissionType,
      render: (row: any) => {
        const typeConfig =
          PERMISSION_TYPE_CONFIG[
            row.type as keyof typeof PERMISSION_TYPE_CONFIG
          ]
        if (!typeConfig) return row.type

        return h(
          'NTag',
          {
            type: typeConfig.type,
            size: 'small',
            style: {
              textDecoration: row.status === 0 ? 'line-through' : 'none',
              opacity: row.status === 0 ? '0.5' : '1',
            },
          },
          {
            icon: () => h(C_Icon, { name: typeConfig.icon, size: 10 }),
            default: () => typeConfig.text,
          }
        )
      },
    },
    {
      key: 'module',
      title: '所属模块',
      width: 120,
      editable: true,
      editType: 'select' as const,
      editOptions: SYSTEM_MODULES,
      render: (row: any) => {
        const module = SYSTEM_MODULES.find(m => m.value === row.module)
        return h(
          'span',
          {
            style: {
              textDecoration: row.status === 0 ? 'line-through' : 'none',
              opacity: row.status === 0 ? '0.6' : '1',
              color:
                row.status === 0
                  ? 'var(--n-text-color-disabled)'
                  : 'var(--n-text-color-base)',
            },
          },
          module?.label || row.module
        )
      },
    },
    {
      key: 'description',
      title: '描述',
      width: 200,
      editable: true,
      editType: 'textarea' as const,
      render: (row: any) =>
        h(
          'span',
          {
            style: {
              textDecoration: row.status === 0 ? 'line-through' : 'none',
              opacity: row.status === 0 ? '0.6' : '1',
              color:
                row.status === 0
                  ? 'var(--n-text-color-disabled)'
                  : 'var(--n-text-color-base)',
            },
          },
          row.description || '-'
        ),
    },
    {
      key: 'resources',
      title: '关联资源',
      width: 160,
      editable: false,
      render: (row: any) => {
        if (!row.resources || row.resources.length === 0) {
          return h(
            'span',
            {
              style: {
                opacity: row.status === 0 ? '0.6' : '1',
                color: 'var(--n-text-color-disabled)',
              },
            },
            '-'
          )
        }
        return h(
          'div',
          row.resources.map((resource: string) =>
            h(
              'div',
              {
                style: {
                  fontSize: '12px',
                  color: '#666',
                  fontFamily: 'Monaco, monospace',
                  textDecoration: row.status === 0 ? 'line-through' : 'none',
                  opacity: row.status === 0 ? '0.6' : '1',
                },
              },
              resource
            )
          )
        )
      },
    },
    {
      key: 'sort',
      title: '排序',
      width: 80,
      editable: true,
      editType: 'number' as const,
      render: (row: any) =>
        h(
          'span',
          {
            style: {
              textDecoration: row.status === 0 ? 'line-through' : 'none',
              opacity: row.status === 0 ? '0.6' : '1',
              color:
                row.status === 0
                  ? 'var(--n-text-color-disabled)'
                  : 'var(--n-text-color-base)',
            },
          },
          row.sort
        ),
    },
    {
      key: 'status',
      title: '状态',
      width: 80,
      editable: false,
      render: (row: any) => {
        const isActive = row.status === 1
        return h(
          'NTag',
          {
            type: isActive ? 'success' : 'error',
            size: 'small',
            class: isActive ? 'status-enabled' : 'status-disabled',
            style: {
              backgroundColor: isActive ? '#f6ffed' : '#fff2f0',
              borderColor: isActive ? '#52c41a' : '#ff4d4f',
              color: isActive ? '#52c41a' : '#ff4d4f',
              fontWeight: '600',
            },
          },
          isActive ? '✓ 启用' : '✕ 禁用'
        )
      },
    },
    {
      key: 'createTime',
      title: '创建时间',
      width: 160,
      editable: false,
      render: (row: any) =>
        h(
          'span',
          {
            style: {
              textDecoration: row.status === 0 ? 'line-through' : 'none',
              opacity: row.status === 0 ? '0.6' : '1',
              color:
                row.status === 0
                  ? 'var(--n-text-color-disabled)'
                  : 'var(--n-text-color-base)',
              fontSize: '12px',
            },
          },
          row.createTime
        ),
    },
  ])

  const tableActions = computed(() => ({
    detail: {
      onView: (row: any) => viewPermission(row),
    },
    edit: {
      onEdit: (row: any) => editPermission(row),
    },
    delete: {
      onDelete: (row: any) => deletePermission(row),
      confirmText: (row: any) => '确认删除权限"' + row.name + '"吗？',
    },
    custom: [
      {
        key: 'copy',
        label: '复制',
        icon: 'mdi:content-copy',
        type: 'info' as const,
        onClick: (row: any) => copyPermission(row),
      },
      {
        key: 'enable',
        label: '启用',
        icon: 'mdi:play',
        type: 'success' as const,
        onClick: (row: any) => togglePermissionStatus(row),
        show: (row: any) => row.status === 0,
      },
      {
        key: 'disable',
        label: '禁用',
        icon: 'mdi:pause',
        type: 'warning' as const,
        onClick: (row: any) => togglePermissionStatus(row),
        show: (row: any) => row.status === 1,
      },
    ],
  }))

  const permissionStats = computed(() => {
    const stats = {
      module: 0,
      function: 0,
      button: 0,
      api: 0,
    }

    permissionList.forEach(perm => {
      if (perm.status === 1) {
        stats[perm.type]++
      }
    })

    return [
      {
        type: 'module',
        label: '模块权限',
        value: stats.module,
        icon: PERMISSION_TYPE_CONFIG.module.icon,
        color: PERMISSION_TYPE_CONFIG.module.color,
      },
      {
        type: 'function',
        label: '功能权限',
        value: stats.function,
        icon: PERMISSION_TYPE_CONFIG.function.icon,
        color: PERMISSION_TYPE_CONFIG.function.color,
      },
      {
        type: 'button',
        label: '按钮权限',
        value: stats.button,
        icon: PERMISSION_TYPE_CONFIG.button.icon,
        color: PERMISSION_TYPE_CONFIG.button.color,
      },
      {
        type: 'api',
        label: 'API权限',
        value: stats.api,
        icon: PERMISSION_TYPE_CONFIG.api.icon,
        color: PERMISSION_TYPE_CONFIG.api.color,
      },
    ]
  })

  // ==================== 行键配置 ====================
  const rowKey = (row: any) => row.id

  // ==================== 工具函数 ====================
  const getModuleName = (moduleValue: string): string => {
    const module = SYSTEM_MODULES.find(m => m.value === moduleValue)
    return module?.label || moduleValue
  }

  const getTypeLabel = (typeValue: string): string => {
    const type = UI_CONFIG.permissionType.find(t => t.value === typeValue)
    return type?.label || typeValue
  }

  const getResourcePlaceholder = (type: string): string => {
    const placeholders = {
      module: '例如：/system, /user',
      function: '例如：/user/list, /role/manage',
      button: '例如：add-user-btn, edit-role-btn',
      api: '例如：/api/user, /api/role/{id}',
    }
    return placeholders[type as keyof typeof placeholders] || ''
  }

  // 统计卡片点击处理
  const handleStatCardClick = (type: string) => {
    if (searchForm.type === type) {
      searchForm.type = null
    } else {
      searchForm.type = type as PermissionType
    }
  }

  // 清空所有筛选条件
  const clearAllFilters = () => {
    Object.assign(searchForm, {
      keyword: '',
      status: null,
      type: null,
      module: null,
    })
  }

  // ==================== 事件处理 ====================
  const handleSearch = () => {
    // 搜索逻辑由计算属性处理
  }

  const refreshData = () => {
    permissionList.length = 0
    permissionList.push(...MOCK_PERMISSION_DATA)
    message.success('刷新成功')
  }

  // 表格保存
  const handleTableSave = (rowData: any) => {
    try {
      updatePermissionInList(rowData.id, {
        name: rowData.name,
        type: rowData.type,
        module: rowData.module,
        description: rowData.description || undefined,
        sort: rowData.sort,
        status: rowData.status,
        updateTime: new Date().toLocaleString(),
      })
      // 同步更新本地数据
      const index = permissionList.findIndex(p => p.id === rowData.id)
      if (index !== -1) {
        Object.assign(permissionList[index], rowData)
      }
      message.success('修改成功')
    } catch {
      message.error('保存失败')
    }
  }

  // 权限操作
  const openPermissionModal = (permission?: PermissionData) => {
    modalMode.value = permission ? 'edit' : 'add'
    if (permission) {
      Object.assign(formData, {
        id: permission.id,
        name: permission.name,
        code: permission.code,
        type: permission.type,
        module: permission.module,
        description: permission.description || '',
        resources: permission.resources?.join(', ') || '',
        sort: permission.sort,
        status: permission.status,
        remark: permission.remark || '',
      })
    } else {
      Object.assign(formData, DEFAULT_PERMISSION_FORM_DATA)
    }
    showModal.value = true
  }

  const closePermissionModal = () => {
    showModal.value = false
    Object.assign(formData, DEFAULT_PERMISSION_FORM_DATA)
  }

  const editPermission = (permission: any) => openPermissionModal(permission)

  const viewPermission = (permission: PermissionData) => {
    currentPermission.value = permission
    showPermissionDetail.value = true
  }

  const copyPermission = (permission: PermissionData) => {
    const newPermission = { ...permission }
    newPermission.name = permission.name + ' - 副本'
    newPermission.code = permission.code + '_copy'
    openPermissionModal(newPermission)
  }

  const togglePermissionStatus = (permission: PermissionData) => {
    const newStatus = permission.status === 1 ? 0 : 1
    updatePermissionInList(permission.id, {
      status: newStatus,
      updateTime: new Date().toLocaleString(),
    })
    // 同步更新本地数据
    const index = permissionList.findIndex(p => p.id === permission.id)
    if (index !== -1) {
      permissionList[index].status = newStatus
    }
    message.success((newStatus === 1 ? '启用' : '禁用') + '成功')
  }

  const deletePermission = (row: any) => {
    removePermissionFromList(row.id)
    // 同步删除本地数据
    const index = permissionList.findIndex(p => p.id === row.id)
    if (index !== -1) {
      permissionList.splice(index, 1)
    }
    message.success('删除成功')
  }

  const handleExport = async () => {
    exportLoading.value = true
    try {
      await exportPermissionApi(searchForm)
      message.success('导出成功')
    } catch {
      message.error('导出失败')
    } finally {
      exportLoading.value = false
    }
  }

  const handleTypeChange = (type: string) => {
    if (formData.module && type) {
      generateCode()
    }
  }

  const handleModuleChange = (module: string) => {
    if (module && formData.type) {
      generateCode()
    }
  }

  const generateCode = () => {
    if (!formData.module || !formData.type) return

    const suggestions = {
      module: formData.module,
      function: formData.module + ':manage',
      button: formData.module + ':add',
      api: formData.module + ':create',
    }

    formData.code = suggestions[formData.type as keyof typeof suggestions] || ''
  }

  // 解析表单资源字符串
  const parseFormResources = (resourcesStr: string): string[] | undefined => {
    if (!resourcesStr) return undefined
    return resourcesStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  // 创建新权限
  const createNewPermission = (): PermissionData => {
    return {
      id: 'perm_' + Date.now(),
      name: formData.name,
      code: formData.code,
      type: formData.type,
      module: formData.module,
      description: formData.description || undefined,
      resources: parseFormResources(formData.resources),
      sort: formData.sort,
      status: formData.status,
      createTime: new Date().toLocaleString(),
      remark: formData.remark || undefined,
    }
  }

  // 更新现有权限数据
  const updateExistingPermission = (permissionId: string) => {
    const updateData = {
      name: formData.name,
      description: formData.description || undefined,
      resources: parseFormResources(formData.resources),
      sort: formData.sort,
      status: formData.status,
      remark: formData.remark || undefined,
      updateTime: new Date().toLocaleString(),
    }

    updatePermissionInList(permissionId, updateData)

    // 同步更新本地数据
    const index = permissionList.findIndex(p => p.id === permissionId)
    if (index !== -1) {
      Object.assign(permissionList[index], updateData)
    }
  }

  const handleSavePermission = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()

      if (modalMode.value === 'add') {
        const newPermission = createNewPermission()
        addPermissionToList(newPermission)
        permissionList.push(newPermission)
        message.success('添加成功')
      } else if (formData.id) {
        updateExistingPermission(formData.id)
        message.success('修改成功')
      }

      showModal.value = false
      return true
    } catch {
      return false
    }
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
