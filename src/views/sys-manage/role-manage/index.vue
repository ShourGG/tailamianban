<template>
  <div class="role-management">
    <!-- 搜索和操作栏 -->
    <NCard class="header-card">
      <NSpace
        justify="space-between"
        align="center"
      >
        <NSpace>
          <NInput
            v-model:value="searchForm.keyword"
            placeholder="搜索角色名称、编码、描述"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <C_Icon
                :name="COMPONENT_CONFIG.icons.search"
                :size="16"
              />
            </template>
          </NInput>

          <NSelect
            v-model:value="searchForm.type"
            placeholder="角色类型"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.roleType"
            @update:value="handleSearch"
          />

          <NSelect
            v-model:value="searchForm.status"
            placeholder="角色状态"
            clearable
            style="width: 120px"
            :options="UI_CONFIG.roleStatus"
            @update:value="handleSearch"
          />
        </NSpace>

        <NSpace>
          <NButton
            type="primary"
            @click="handleAddRoleModal()"
          >
            <template #icon>
              <C_Icon
                :name="COMPONENT_CONFIG.icons.plus"
                :size="16"
              />
            </template>
            新增角色
          </NButton>
          <NButton @click="refreshData">
            <template #icon>
              <C_Icon
                :name="COMPONENT_CONFIG.icons.refresh"
                :size="16"
              />
            </template>
            刷新
          </NButton>
        </NSpace>
      </NSpace>
    </NCard>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <NCard class="content-card">
        <template #header>
          <NSpace
            justify="space-between"
            align="center"
          >
            <NText>
              角色列表
              <NTag
                type="info"
                size="small"
                style="margin-left: 8px"
              >
                共 {{ pagination.itemCount }} 个
              </NTag>
            </NText>
            <NSpace>
              <NButton
                v-if="selectedRoles.length > 0"
                type="warning"
                size="small"
                @click="() => handleBatchOperation('toggle', batchToggleRoles)"
              >
                <template #icon>
                  <C_Icon
                    :name="COMPONENT_CONFIG.icons.toggle"
                    :size="14"
                  />
                </template>
                批量操作
              </NButton>
              <NButton
                v-if="selectedRoles.length > 0"
                type="error"
                size="small"
                @click="() => handleBatchOperation('delete', batchDeleteRoles)"
              >
                <template #icon>
                  <C_Icon
                    :name="COMPONENT_CONFIG.icons.delete"
                    :size="14"
                  />
                </template>
                批量删除
              </NButton>
            </NSpace>
          </NSpace>
        </template>

        <!-- 角色表格 -->
        <NDataTable
          ref="tableRef"
          v-model:checked-row-keys="selectedRoles"
          :columns="roleColumns"
          :data="roleList"
          :pagination="paginationReactive"
          :loading="loading"
          :row-key="(row: RoleData) => row.id"
          :scroll-x="1400"
          :row-class-name="getRowClassName"
          size="small"
          remote
          striped
          @update:checked-row-keys="handleSelectionChange"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </NCard>
    </div>

    <!-- 角色详情抽屉 -->
    <NDrawer
      v-model:show="showRoleDetail"
      :width="600"
      placement="right"
    >
      <NDrawerContent
        title="角色详情"
        closable
      >
        <div
          class="role-detail"
          v-if="currentRole"
        >
          <NSpace
            vertical
            :size="24"
          >
            <!-- 基本信息 -->
            <NCard
              title="基本信息"
              size="small"
              :class="{ 'disabled-card': currentRole.status === 0 }"
            >
              <NGrid
                :cols="2"
                :x-gap="16"
                :y-gap="12"
              >
                <NGi
                  v-for="field in getRoleDetailFields(currentRole)"
                  :key="field.key"
                >
                  <NSpace align="center">
                    <NText depth="3">{{ field.label }}：</NText>
                    <component
                      :is="field.component"
                      v-bind="field.props"
                    >
                      {{ field.value }}
                    </component>
                  </NSpace>
                </NGi>
              </NGrid>
            </NCard>

            <!-- 权限信息 -->
            <NCard
              title="权限信息"
              size="small"
              v-if="currentRole.permissionNames?.length"
              :class="{ 'disabled-card': currentRole.status === 0 }"
            >
              <NSpace>
                <NTag
                  v-for="permission in currentRole.permissionNames"
                  :key="permission"
                  type="primary"
                  size="medium"
                  :class="{ 'disabled-tag': currentRole.status === 0 }"
                >
                  <template #icon>
                    <C_Icon
                      :name="COMPONENT_CONFIG.icons.permission"
                      :size="12"
                    />
                  </template>
                  {{ permission }}
                </NTag>
              </NSpace>
            </NCard>

            <!-- 时间信息 -->
            <NCard
              title="时间信息"
              size="small"
              :class="{ 'disabled-card': currentRole.status === 0 }"
            >
              <NGrid
                :cols="1"
                :y-gap="12"
              >
                <NGi
                  v-for="timeField in getTimeFields(currentRole)"
                  :key="timeField.key"
                >
                  <NSpace align="center">
                    <NText depth="3">{{ timeField.label }}：</NText>
                    <NText
                      :class="{ 'disabled-text': currentRole.status === 0 }"
                    >
                      {{ timeField.value }}
                    </NText>
                  </NSpace>
                </NGi>
              </NGrid>
            </NCard>

            <!-- 备注信息 -->
            <NCard
              v-if="currentRole.remark"
              title="备注信息"
              size="small"
              :class="{ 'disabled-card': currentRole.status === 0 }"
            >
              <NText :class="{ 'disabled-text': currentRole.status === 0 }">
                {{ currentRole.remark }}
              </NText>
            </NCard>

            <!-- 操作按钮 -->
            <NSpace justify="center">
              <NButton
                type="primary"
                @click="showRoleDetail = false"
                >关闭</NButton
              >
            </NSpace>
          </NSpace>
        </div>
      </NDrawerContent>
    </NDrawer>

    <!-- 添加/编辑角色弹窗 -->
    <NModal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      :positive-text="modalMode === 'add' ? '确认添加' : '确认修改'"
      negative-text="取消"
      @positive-click="handleSaveRole"
      @negative-click="handleCancelModal"
      style="width: 800px"
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
          <!-- 表单字段 -->
          <NGi
            v-for="field in getFormFields()"
            :key="field.key"
          >
            <NFormItem
              :label="field.label"
              :path="field.path"
              v-if="field.condition"
            >
              <component
                :is="field.component"
                v-bind="field.props"
                v-model:value="formData[field.key]"
              />
            </NFormItem>
          </NGi>
        </NGrid>

        <!-- 权限分配 -->
        <NFormItem
          label="权限分配"
          path="permissionIds"
        >
          <NTree
            :data="permissionTreeData"
            :checked-keys="formData.permissionIds"
            checkable
            cascade
            key-field="id"
            label-field="name"
            children-field="children"
            @update:checked-keys="handlePermissionChange"
            style="max-height: 300px; overflow: auto"
          />
        </NFormItem>

        <NFormItem
          label="备注"
          path="remark"
        >
          <NInput
            v-model:value="formData.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { type FormInst, type DataTableColumns } from 'naive-ui/es'
  import C_Icon from '@/components/global/C_Icon/index.vue'
  import {
    type RoleData,
    type RoleFormData,
    type PermissionData,
    type SearchForm,
    type RoleType,
    ROLE_FORM_RULES,
    DEFAULT_ROLE_FORM_DATA,
    UI_CONFIG,
    getRoleListApi,
    getPermissionListApi,
    MOCK_ROLE_DATA,
    MOCK_PERMISSION_DATA,
  } from './data'

  // ==================== 组件配置 ====================
  const COMPONENT_CONFIG = {
    icons: {
      search: 'mdi:magnify',
      plus: 'mdi:plus',
      refresh: 'mdi:refresh',
      toggle: 'mdi:toggle-switch',
      delete: 'mdi:delete',
      edit: 'mdi:pencil',
      eye: 'mdi:eye',
      pause: 'mdi:pause',
      play: 'mdi:play',
      permission: 'mdi:shield-account',
      check: 'mdi:check-circle',
      info: 'mdi:information',
      users: 'mdi:account-group',
    },
    statusConfig: {
      1: { text: '正常', type: 'success' as const, icon: 'mdi:check-circle' },
      0: { text: '禁用', type: 'error' as const, icon: 'mdi:pause-circle' },
    },
    roleTypeConfig: {
      system: { text: '系统', type: 'error' as const, icon: 'mdi:cog' },
      custom: {
        text: '自定义',
        type: 'info' as const,
        icon: 'mdi:account-key',
      },
      temp: { text: '临时', type: 'warning' as const, icon: 'mdi:clock' },
    },
    batchConfig: {
      delete: {
        title: '批量删除',
        content: '确认删除选中的角色吗？此操作不可恢复！',
        type: 'error' as const,
      },
      toggle: {
        title: '批量状态操作',
        content: '确认对选中的角色进行状态切换吗？',
        type: 'warning' as const,
      },
    },
  } as const

  const message = useMessage()
  const dialog = useDialog()

  // ==================== 响应式数据 ====================
  const loading = ref(false)
  const showModal = ref(false)
  const showRoleDetail = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInst | null>(null)
  const tableRef = ref()
  const selectedRoles = ref<string[]>([])
  const currentRole = ref<RoleData | null>(null)

  const roleList = reactive<RoleData[]>([])
  const permissionList = reactive<PermissionData[]>([])

  const formData = reactive<RoleFormData>({ ...DEFAULT_ROLE_FORM_DATA })
  const formRules = ROLE_FORM_RULES

  const searchForm = reactive<SearchForm>({
    keyword: '',
    status: null,
    type: null,
  })

  const pagination = reactive({
    page: 1,
    pageSize: 20,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    showQuickJumper: true,
  })

  // ==================== 计算属性 ====================
  const modalTitle = computed(() =>
    modalMode.value === 'add' ? '新增角色' : '编辑角色'
  )

  const permissionTreeData = computed(() => permissionList)

  const paginationReactive = computed(() => ({
    ...pagination,
    onChange: (page: number) => handlePageChange(page),
    onUpdatePageSize: (pageSize: number) => handlePageSizeChange(pageSize),
  }))

  // ==================== 辅助函数 ====================
  const getPermissionNameById = (permissionId: string): string =>
    findPermissionById(MOCK_PERMISSION_DATA, permissionId)?.name || ''

  const findPermissionById = (
    permissions: PermissionData[],
    id: string
  ): PermissionData | null => {
    for (const permission of permissions) {
      if (permission.id === id) return permission
      if (permission.children) {
        const found = findPermissionById(permission.children, id)
        if (found) return found
      }
    }
    return null
  }

  const updateRoleInList = (roleId: string, updates: Partial<RoleData>) => {
    // 更新所有相关的数据源
    const updateTargets = [
      { data: MOCK_ROLE_DATA, key: 'id' },
      { data: roleList, key: 'id' },
    ]

    updateTargets.forEach(({ data, key }) => {
      const index = data.findIndex((item: any) => item[key] === roleId)
      if (index !== -1) {
        data[index] = { ...data[index], ...updates }
      }
    })

    // 更新当前角色详情
    if (currentRole.value?.id === roleId) {
      currentRole.value = { ...currentRole.value, ...updates }
    }
  }

  const getRoleStatusConfig = (status: number) =>
    COMPONENT_CONFIG.statusConfig[
      status as keyof typeof COMPONENT_CONFIG.statusConfig
    ] || COMPONENT_CONFIG.statusConfig[1]

  const getRoleTypeConfig = (type: RoleType) =>
    COMPONENT_CONFIG.roleTypeConfig[type] ||
    COMPONENT_CONFIG.roleTypeConfig.custom

  const getRowClassName = (row: RoleData) =>
    row.status === 0 ? 'disabled-row' : ''

  // ==================== 渲染函数 ====================
  const createTagRenderer =
    (getConfig: (value: any) => any, valueKey: string) => (row: RoleData) =>
      h(
        NTag,
        {
          type: getConfig(row[valueKey as keyof RoleData]).type,
          size: 'small',
          class: { 'disabled-tag': row.status === 0 },
        },
        {
          icon: () =>
            h(C_Icon, {
              name: getConfig(row[valueKey as keyof RoleData]).icon,
              size: 10,
            }),
          default: () => getConfig(row[valueKey as keyof RoleData]).text,
        }
      )

  const createTextRenderer =
    (key: keyof RoleData, fallback = '-') =>
    (row: RoleData) =>
      h(
        'div',
        { class: { 'disabled-text': row.status === 0 } },
        row[key] || fallback
      )

  const createPermissionsRenderer = (row: RoleData) => {
    if (!row.permissionNames || row.permissionNames.length === 0) {
      return h('div', '-')
    }

    const displayCount = 2
    const permissions = row.permissionNames
    const displayPermissions = permissions.slice(0, displayCount)
    const hasMore = permissions.length > displayCount

    return h(
      NSpace,
      { size: 4 },
      {
        default: () => [
          ...displayPermissions.map(permission =>
            h(
              NTag,
              {
                key: permission,
                size: 'small',
                type: 'primary',
                class: { 'disabled-tag': row.status === 0 },
              },
              { default: () => permission }
            )
          ),
          ...(hasMore
            ? [
                h(
                  NTag,
                  {
                    size: 'small',
                    type: 'default',
                    class: { 'disabled-tag': row.status === 0 },
                  },
                  { default: () => `+${permissions.length - displayCount}` }
                ),
              ]
            : []),
        ],
      }
    )
  }

  const createActionButtons = (row: RoleData) => {
    const buttons = [
      {
        icon: COMPONENT_CONFIG.icons.eye,
        text: '详情',
        type: 'info' as const,
        onClick: () => handleViewRole(row),
      },
      {
        icon: COMPONENT_CONFIG.icons.edit,
        text: '编辑',
        onClick: () => handleEditRole(row),
      },
      {
        icon:
          row.status === 1
            ? COMPONENT_CONFIG.icons.pause
            : COMPONENT_CONFIG.icons.play,
        text: row.status === 1 ? '禁用' : '启用',
        type: row.status === 1 ? ('warning' as const) : ('success' as const),
        onClick: () => handleToggleRoleStatus(row),
        disabled: row.type === 'system' && row.code === 'super_admin',
      },
    ]

    return h(
      'div',
      { style: { display: 'flex', gap: '4px', flexWrap: 'nowrap' } },
      [
        ...buttons.map(btn =>
          h(
            NButton,
            {
              size: 'tiny',
              type: btn.type,
              disabled: btn.disabled,
              onClick: btn.onClick,
            },
            {
              icon: () => h(C_Icon, { name: btn.icon, size: 12 }),
              default: () => btn.text,
            }
          )
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDeleteRole(row.id),
            disabled: row.type === 'system',
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  size: 'tiny',
                  type: 'error',
                  disabled: row.type === 'system',
                },
                {
                  icon: () =>
                    h(C_Icon, {
                      name: COMPONENT_CONFIG.icons.delete,
                      size: 12,
                    }),
                  default: () => '删除',
                }
              ),
            default: () =>
              row.type === 'system' ? '系统角色不可删除' : '确认删除该角色吗？',
          }
        ),
      ]
    )
  }

  // ==================== 表格列配置 ====================
  const roleColumns: DataTableColumns<RoleData> = [
    { type: 'selection', disabled: (row: RoleData) => row.type === 'system' },
    {
      title: '角色类型',
      key: 'type',
      width: 100,
      render: createTagRenderer(getRoleTypeConfig, 'type'),
    },
    {
      title: '角色名称',
      key: 'name',
      width: 120,
      fixed: 'left',
      render: createTextRenderer('name'),
    },
    {
      title: '角色编码',
      key: 'code',
      width: 120,
      render: createTextRenderer('code'),
    },
    {
      title: '描述',
      key: 'description',
      width: 180,
      render: createTextRenderer('description'),
    },
    {
      title: '权限',
      key: 'permissionNames',
      width: 200,
      render: createPermissionsRenderer,
    },
    {
      title: '用户数',
      key: 'userCount',
      width: 80,
      render: row =>
        h(
          'div',
          {
            class: { 'disabled-text': row.status === 0 },
          },
          [
            h(C_Icon, {
              name: COMPONENT_CONFIG.icons.users,
              size: 14,
              style: { marginRight: '4px' },
            }),
            h('span', row.userCount || 0),
          ]
        ),
    },
    {
      title: '排序',
      key: 'sort',
      width: 80,
      render: createTextRenderer('sort'),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: createTagRenderer(getRoleStatusConfig, 'status'),
    },
    {
      title: '创建时间',
      key: 'createTime',
      width: 160,
      render: createTextRenderer('createTime'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: createActionButtons,
    },
  ]

  // ==================== 角色详情字段配置 ====================
  const getRoleDetailFields = (role: RoleData) => [
    {
      key: 'name',
      label: '角色名称',
      value: role.name,
      component: 'div',
      props: { class: { 'disabled-text': role.status === 0 } },
    },
    {
      key: 'code',
      label: '角色编码',
      value: role.code,
      component: 'div',
      props: { class: { 'disabled-text': role.status === 0 } },
    },
    {
      key: 'type',
      label: '角色类型',
      value: getRoleTypeConfig(role.type).text,
      component: NTag,
      props: {
        type: getRoleTypeConfig(role.type).type,
        size: 'small',
        class: { 'disabled-tag': role.status === 0 },
      },
    },
    {
      key: 'description',
      label: '角色描述',
      value: role.description || '-',
      component: 'div',
      props: { class: { 'disabled-text': role.status === 0 } },
    },
    {
      key: 'userCount',
      label: '用户数量',
      value: `${role.userCount || 0} 人`,
      component: 'div',
      props: { class: { 'disabled-text': role.status === 0 } },
    },
    {
      key: 'sort',
      label: '排序',
      value: role.sort,
      component: 'div',
      props: { class: { 'disabled-text': role.status === 0 } },
    },
    {
      key: 'status',
      label: '角色状态',
      value: getRoleStatusConfig(role.status).text,
      component: NTag,
      props: { type: getRoleStatusConfig(role.status).type, size: 'small' },
    },
  ]

  const getTimeFields = (role: RoleData) => [
    { key: 'createTime', label: '创建时间', value: role.createTime },
    ...(role.updateTime
      ? [{ key: 'updateTime', label: '更新时间', value: role.updateTime }]
      : []),
  ]

  // ==================== 表单字段配置 ====================
  const getFormFields = (): Array<{
    key: keyof RoleFormData
    label: string
    path: string
    component: any
    props: any
    condition: boolean
  }> => [
    {
      key: 'name' as keyof RoleFormData,
      label: '角色名称',
      path: 'name',
      component: NInput,
      props: { placeholder: '请输入角色名称' },
      condition: true,
    },
    {
      key: 'code' as keyof RoleFormData,
      label: '角色编码',
      path: 'code',
      component: NInput,
      props: {
        placeholder: '请输入角色编码',
        disabled: modalMode.value === 'edit',
        ...(modalMode.value === 'edit' && {
          suffix: () =>
            h(
              NTooltip,
              {},
              {
                trigger: () =>
                  h(C_Icon, { name: COMPONENT_CONFIG.icons.info, size: 16 }),
                default: () => '角色编码创建后不可修改',
              }
            ),
        }),
      },
      condition: true,
    },
    {
      key: 'type' as keyof RoleFormData,
      label: '角色类型',
      path: 'type',
      component: NSelect,
      props: {
        options: UI_CONFIG.roleType,
        placeholder: '请选择角色类型',
        disabled: modalMode.value === 'edit',
      },
      condition: true,
    },
    {
      key: 'sort' as keyof RoleFormData,
      label: '排序',
      path: 'sort',
      component: NInputNumber,
      props: {
        placeholder: '请输入排序值',
        min: 0,
        max: 9999,
        style: { width: '100%' },
      },
      condition: true,
    },
    {
      key: 'description' as keyof RoleFormData,
      label: '角色描述',
      path: 'description',
      component: NInput,
      props: {
        type: 'textarea',
        placeholder: '请输入角色描述',
        rows: 3,
      },
      condition: true,
    },
    {
      key: 'status' as keyof RoleFormData,
      label: '角色状态',
      path: 'status',
      component: NSwitch,
      props: {
        checkedValue: 1,
        uncheckedValue: 0,
        ...(modalMode.value === 'edit' && {
          checked: () => '正常',
          unchecked: () => '禁用',
        }),
      },
      condition: true,
    },
  ]

  // ==================== 组合式函数 ====================
  const useBatchOperations = () => {
    const handleBatchOperation = (
      operation: 'delete' | 'toggle',
      actionFn: (ids: string[]) => void
    ) => {
      if (selectedRoles.value.length === 0) {
        message.warning('请先选择角色')
        return
      }

      // 检查是否包含系统角色
      const systemRoles = selectedRoles.value.filter(id => {
        const role = MOCK_ROLE_DATA.find(r => r.id === id)
        return role?.type === 'system'
      })

      if (systemRoles.length > 0) {
        message.warning('不能对系统角色进行批量操作')
        return
      }

      const config = COMPONENT_CONFIG.batchConfig[operation]
      const content = `${config.content.replace('选中的角色', `选中的 ${selectedRoles.value.length} 个角色`)}`

      dialog[config.type]({
        title: config.title,
        content,
        positiveText: '确认',
        negativeText: '取消',
        onPositiveClick: async () => {
          try {
            actionFn(selectedRoles.value)
            message.success(
              `批量${operation === 'delete' ? '删除' : '操作'}成功`
            )
            selectedRoles.value = []
            await loadRoles()
          } catch {
            message.error(`批量${operation === 'delete' ? '删除' : '操作'}失败`)
          }
        },
      })
    }

    const batchDeleteRoles = (ids: string[]) => {
      ids.forEach(id => {
        const roleIndex = MOCK_ROLE_DATA.findIndex(role => role.id === id)
        if (roleIndex !== -1) {
          MOCK_ROLE_DATA.splice(roleIndex, 1)
        }
      })
    }

    const batchToggleRoles = (ids: string[]) => {
      ids.forEach(id => {
        const role = MOCK_ROLE_DATA.find(r => r.id === id)
        if (role) {
          updateRoleInList(id, {
            status: role.status === 1 ? 0 : 1,
            updateTime: new Date().toLocaleString(),
          })
        }
      })
    }

    return { handleBatchOperation, batchDeleteRoles, batchToggleRoles }
  }

  const useRoleOperations = () => {
    // 提取角色数据构建逻辑，降低复杂度
    const buildRoleData = (
      roleData: RoleFormData,
      existingRole?: RoleData
    ): RoleData => {
      const baseData = {
        name: roleData.name,
        code: roleData.code,
        type: roleData.type,
        status: roleData.status,
        description: roleData.description || undefined,
        permissionIds: roleData.permissionIds,
        permissionNames: roleData.permissionIds.map(id =>
          getPermissionNameById(id)
        ),
        sort: roleData.sort,
        remark: roleData.remark || undefined,
      }

      if (existingRole) {
        return {
          ...existingRole,
          ...baseData,
          updateTime: new Date().toLocaleString(),
        }
      }

      return {
        id: `role_${Date.now()}`,
        userCount: 0,
        createTime: new Date().toLocaleString(),
        ...baseData,
      }
    }

    // 提取验证逻辑
    const validateRoleData = (
      roleData: RoleFormData,
      mode: 'add' | 'edit'
    ): { valid: boolean; error?: string } => {
      if (mode === 'edit' && !roleData.id) {
        return { valid: false, error: '角色ID不存在' }
      }

      if (mode === 'add') {
        const existingRole = MOCK_ROLE_DATA.find(
          role => role.code === roleData.code
        )
        if (existingRole) {
          return { valid: false, error: '角色编码已存在' }
        }
      }

      return { valid: true }
    }

    const handleAddRoleData = async (
      roleData: RoleFormData
    ): Promise<boolean> => {
      const validation = validateRoleData(roleData, 'add')
      if (!validation.valid) {
        message.error(validation.error!)
        return false
      }

      const newRole = buildRoleData(roleData)
      MOCK_ROLE_DATA.push(newRole)
      message.success('添加成功')
      return true
    }

    const handleUpdateRoleData = async (
      roleData: RoleFormData
    ): Promise<boolean> => {
      const validation = validateRoleData(roleData, 'edit')
      if (!validation.valid) {
        message.error(validation.error!)
        return false
      }

      const roleIndex = MOCK_ROLE_DATA.findIndex(
        role => role.id === roleData.id
      )
      if (roleIndex === -1) {
        message.error('角色不存在')
        return false
      }

      const existingRole = MOCK_ROLE_DATA[roleIndex]
      const updatedRole = buildRoleData(roleData, existingRole)

      MOCK_ROLE_DATA[roleIndex] = updatedRole

      if (currentRole.value?.id === roleData.id) {
        currentRole.value = { ...updatedRole }
      }

      message.success('修改成功')
      return true
    }

    return { handleAddRoleData, handleUpdateRoleData }
  }

  // ==================== 使用组合式函数 ====================
  const { handleBatchOperation, batchDeleteRoles, batchToggleRoles } =
    useBatchOperations()
  const { handleAddRoleData, handleUpdateRoleData } = useRoleOperations()

  // ==================== 事件处理函数 ====================
  const handleSearch = () => {
    pagination.page = 1
    loadRoles()
  }

  const handleSelectionChange = (keys: string[]) => {
    selectedRoles.value = keys
  }

  const handlePageChange = (page: number) => {
    pagination.page = page
    loadRoles()
  }

  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    loadRoles()
  }

  const refreshData = async () => {
    await Promise.all([loadRoles(), loadPermissions()])
    message.success('刷新成功')
  }

  const handlePermissionChange = (checkedKeys: string[]) => {
    formData.permissionIds = checkedKeys
  }

  const handleAddRoleModal = () => {
    modalMode.value = 'add'
    Object.assign(formData, DEFAULT_ROLE_FORM_DATA)
    showModal.value = true
  }

  const handleEditRole = (role: RoleData) => {
    modalMode.value = 'edit'
    Object.assign(formData, {
      id: role.id,
      name: role.name,
      code: role.code,
      type: role.type,
      status: role.status,
      description: role.description || '',
      permissionIds: role.permissionIds || [],
      sort: role.sort,
      remark: role.remark || '',
    })
    showModal.value = true
  }

  const handleViewRole = (role: RoleData) => {
    currentRole.value = role
    showRoleDetail.value = true
  }

  const handleToggleRoleStatus = async (role: RoleData) => {
    if (role.type === 'system' && role.code === 'super_admin') {
      message.warning('超级管理员角色不能禁用')
      return
    }

    const newStatus = role.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'

    try {
      updateRoleInList(role.id, {
        status: newStatus,
        updateTime: new Date().toLocaleString(),
      })
      message.success(`${statusText}成功`)
    } catch (error) {
      console.error('状态切换失败:', error)
      message.error(`${statusText}失败`)
    }
  }

  const handleDeleteRole = async (id: string) => {
    const role = MOCK_ROLE_DATA.find(r => r.id === id)
    if (role?.type === 'system') {
      message.warning('系统角色不能删除')
      return
    }

    try {
      const roleIndex = MOCK_ROLE_DATA.findIndex(role => role.id === id)
      if (roleIndex !== -1) {
        MOCK_ROLE_DATA.splice(roleIndex, 1)
      }
      message.success('删除成功')
      await loadRoles()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSaveRole = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()
      const success =
        modalMode.value === 'add'
          ? await handleAddRoleData(formData)
          : await handleUpdateRoleData(formData)

      if (success) {
        showModal.value = false
        await loadRoles()
      }
      return success
    } catch (error) {
      if (error instanceof Array) return false
      message.error('保存失败')
      return false
    }
  }

  const handleCancelModal = () => {
    showModal.value = false
    Object.assign(formData, DEFAULT_ROLE_FORM_DATA)
  }

  // ==================== 数据加载 ====================
  const loadRoles = async () => {
    loading.value = true
    try {
      const params = {
        ...searchForm,
        page: pagination.page,
        pageSize: pagination.pageSize,
      }
      const response = await getRoleListApi(params)
      roleList.length = 0
      roleList.push(...response.data.list)
      pagination.itemCount = response.data.total
    } catch {
      message.error('加载角色列表失败')
    } finally {
      loading.value = false
    }
  }

  const loadPermissions = async () => {
    try {
      const response = await getPermissionListApi()
      permissionList.length = 0
      permissionList.push(...response.data)
    } catch {
      message.error('加载权限列表失败')
    }
  }

  // 生命周期
  onMounted(async () => {
    await Promise.all([loadRoles(), loadPermissions()])
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
