<template>
  <div class="user-management">
    <!-- 搜索和操作栏 -->
    <NCard class="header-card">
      <NSpace
        justify="space-between"
        align="center"
      >
        <NSpace>
          <NInput
            v-model:value="searchForm.keyword"
            placeholder="搜索用户名、昵称、邮箱"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <C_Icon
                name="mdi:magnify"
                :size="16"
              />
            </template>
          </NInput>

          <NSelect
            v-model:value="searchForm.userType"
            placeholder="用户类型"
            clearable
            style="width: 120px"
            :options="userTypeOptions"
            @update:value="handleSearch"
          />

          <NSelect
            v-model:value="searchForm.status"
            placeholder="用户状态"
            clearable
            style="width: 120px"
            :options="userStatusOptions"
            @update:value="handleSearch"
          />

          <NSelect
            v-model:value="searchForm.roleId"
            placeholder="用户角色"
            clearable
            style="width: 120px"
            :options="userRoleOptions"
            @update:value="handleSearch"
          />
        </NSpace>

        <NSpace>
          <NButton
            type="primary"
            @click="handleAddUserModal()"
          >
            <template #icon>
              <C_Icon
                name="mdi:plus"
                :size="16"
              />
            </template>
            新增用户
          </NButton>
          <NButton @click="expandAll">
            <template #icon>
              <C_Icon
                name="mdi:file-tree"
                :size="16"
              />
            </template>
            {{ isAllExpanded ? '收起全部' : '展开全部' }}
          </NButton>
          <NButton @click="refreshData">
            <template #icon>
              <C_Icon
                name="mdi:refresh"
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
      <NGrid
        :cols="24"
        :x-gap="16"
        responsive="screen"
      >
        <!-- 左侧部门树 -->
        <NGi
          :span="6"
          :md="8"
          :sm="24"
        >
          <NCard
            title="组织架构"
            class="content-card"
          >
            <C_Tree
              ref="deptTreeRef"
              mode="custom"
              :data="deptList"
              :searchable="false"
              :show-toolbar="false"
              :icon-config="deptIconConfig"
              :default-expanded-keys="expandedDeptKeys"
              :default-selected-keys="selectedDeptKeys"
              @node-select="handleDeptSelect"
              class="dept-tree"
            />
          </NCard>
        </NGi>

        <!-- 右侧用户列表 -->
        <NGi
          :span="18"
          :md="16"
          :sm="24"
        >
          <NCard class="content-card">
            <template #header>
              <NSpace
                justify="space-between"
                align="center"
              >
                <NText>
                  {{
                    selectedDept
                      ? `${selectedDept.name} - 用户列表`
                      : '用户列表'
                  }}
                  <NTag
                    type="info"
                    size="small"
                    style="margin-left: 8px"
                  >
                    共 {{ pagination.itemCount }} 人
                  </NTag>
                </NText>
                <NSpace>
                  <NButton
                    v-if="selectedUsers.length > 0"
                    type="warning"
                    size="small"
                    @click="handleBatchToggleStatus"
                  >
                    <template #icon>
                      <C_Icon
                        name="mdi:toggle-switch"
                        :size="14"
                      />
                    </template>
                    批量操作
                  </NButton>
                  <NButton
                    v-if="selectedUsers.length > 0"
                    type="error"
                    size="small"
                    @click="handleBatchDelete"
                  >
                    <template #icon>
                      <C_Icon
                        name="mdi:delete"
                        :size="14"
                      />
                    </template>
                    批量删除
                  </NButton>
                </NSpace>
              </NSpace>
            </template>

            <!-- 用户表格 -->
            <NDataTable
              ref="tableRef"
              v-model:checked-row-keys="selectedUsers"
              :columns="userColumns"
              :data="userList"
              :pagination="paginationReactive"
              :loading="loading"
              :row-key="(row: UserData) => row.id"
              :scroll-x="1600"
              :row-class-name="getRowClassName"
              size="small"
              remote
              striped
              @update:checked-row-keys="handleSelectionChange"
              @update:page="handlePageChange"
              @update:page-size="handlePageSizeChange"
            />
          </NCard>
        </NGi>
      </NGrid>
    </div>

    <!-- 用户详情抽屉 -->
    <NDrawer
      v-model:show="showUserDetail"
      :width="600"
      placement="right"
    >
      <NDrawerContent
        title="用户详情"
        closable
      >
        <div
          class="user-detail"
          v-if="currentUser"
        >
          <NSpace
            vertical
            :size="24"
          >
            <!-- 用户头像和基本信息 -->
            <NCard
              title="基本信息"
              size="small"
              :class="{ 'disabled-card': currentUser.status === 0 }"
            >
              <NSpace
                vertical
                :size="16"
              >
                <NSpace
                  align="center"
                  justify="center"
                  style="position: relative"
                >
                  <NAvatar
                    :size="80"
                    :src="currentUser.avatar"
                    :fallback-src="defaultAvatar"
                    :class="{ 'disabled-avatar': currentUser.status === 0 }"
                  >
                    {{ currentUser.nickname?.charAt(0) }}
                  </NAvatar>
                  <div
                    v-if="currentUser.status === 0"
                    class="disabled-overlay"
                  >
                    <C_Icon
                      name="mdi:cancel"
                      :size="24"
                      color="#ff4d4f"
                    />
                  </div>
                </NSpace>

                <NGrid
                  :cols="2"
                  :x-gap="16"
                  :y-gap="12"
                >
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">用户名：</NText>
                      <NText
                        :class="{ 'disabled-text': currentUser.status === 0 }"
                      >
                        {{ currentUser.username }}
                      </NText>
                    </NSpace>
                  </NGi>
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">昵称：</NText>
                      <NText
                        :class="{ 'disabled-text': currentUser.status === 0 }"
                      >
                        {{ currentUser.nickname }}
                      </NText>
                    </NSpace>
                  </NGi>
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">用户类型：</NText>
                      <NTag
                        :type="getUserTypeConfig(currentUser.userType).type"
                        size="small"
                        :class="{ 'disabled-tag': currentUser.status === 0 }"
                      >
                        <template #icon>
                          <C_Icon
                            :name="getUserTypeConfig(currentUser.userType).icon"
                            :size="10"
                          />
                        </template>
                        {{ getUserTypeConfig(currentUser.userType).text }}
                      </NTag>
                    </NSpace>
                  </NGi>
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">邮箱：</NText>
                      <NText
                        :class="{ 'disabled-text': currentUser.status === 0 }"
                      >
                        {{ currentUser.email || '-' }}
                      </NText>
                    </NSpace>
                  </NGi>
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">手机号：</NText>
                      <NText
                        :class="{ 'disabled-text': currentUser.status === 0 }"
                      >
                        {{ currentUser.phone || '-' }}
                      </NText>
                    </NSpace>
                  </NGi>
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">所属部门：</NText>
                      <NTag
                        type="info"
                        size="small"
                        :class="{ 'disabled-tag': currentUser.status === 0 }"
                      >
                        {{ currentUser.deptName || '-' }}
                      </NTag>
                    </NSpace>
                  </NGi>
                  <NGi v-if="currentUser.userType === 'external'">
                    <NSpace align="center">
                      <NText depth="3">公司名称：</NText>
                      <NText
                        :class="{ 'disabled-text': currentUser.status === 0 }"
                      >
                        {{ currentUser.companyName || '-' }}
                      </NText>
                    </NSpace>
                  </NGi>
                  <NGi v-if="currentUser.userType === 'external'">
                    <NSpace align="center">
                      <NText depth="3">联系人：</NText>
                      <NText
                        :class="{ 'disabled-text': currentUser.status === 0 }"
                      >
                        {{ currentUser.contactPerson || '-' }}
                      </NText>
                    </NSpace>
                  </NGi>
                  <NGi>
                    <NSpace align="center">
                      <NText depth="3">用户状态：</NText>
                      <NTag
                        :type="getUserStatusConfig(currentUser.status).type"
                        size="small"
                      >
                        <template #icon>
                          <C_Icon
                            :name="getUserStatusConfig(currentUser.status).icon"
                            :size="10"
                          />
                        </template>
                        {{ getUserStatusConfig(currentUser.status).text }}
                      </NTag>
                    </NSpace>
                  </NGi>
                </NGrid>
              </NSpace>
            </NCard>

            <!-- 角色信息 -->
            <NCard
              title="角色信息"
              size="small"
              v-if="currentUser.roleNames?.length"
              :class="{ 'disabled-card': currentUser.status === 0 }"
            >
              <NSpace>
                <NTag
                  v-for="role in currentUser.roleNames"
                  :key="role"
                  type="success"
                  size="medium"
                  :class="{ 'disabled-tag': currentUser.status === 0 }"
                >
                  <template #icon>
                    <C_Icon
                      name="mdi:account-key"
                      :size="12"
                    />
                  </template>
                  {{ role }}
                </NTag>
              </NSpace>
            </NCard>

            <!-- 时间信息 -->
            <NCard
              title="时间信息"
              size="small"
              :class="{ 'disabled-card': currentUser.status === 0 }"
            >
              <NGrid
                :cols="1"
                :y-gap="12"
              >
                <NGi>
                  <NSpace align="center">
                    <NText depth="3">创建时间：</NText>
                    <NText
                      :class="{ 'disabled-text': currentUser.status === 0 }"
                    >
                      {{ currentUser.createTime }}
                    </NText>
                  </NSpace>
                </NGi>
                <NGi v-if="currentUser.updateTime">
                  <NSpace align="center">
                    <NText depth="3">更新时间：</NText>
                    <NText
                      :class="{ 'disabled-text': currentUser.status === 0 }"
                    >
                      {{ currentUser.updateTime }}
                    </NText>
                  </NSpace>
                </NGi>
                <NGi v-if="currentUser.lastLoginTime">
                  <NSpace align="center">
                    <NText depth="3">最后登录：</NText>
                    <NText
                      :class="{ 'disabled-text': currentUser.status === 0 }"
                    >
                      {{ currentUser.lastLoginTime }}
                    </NText>
                  </NSpace>
                </NGi>
              </NGrid>
            </NCard>

            <!-- 备注信息 -->
            <NCard
              v-if="currentUser.remark"
              title="备注信息"
              size="small"
              :class="{ 'disabled-card': currentUser.status === 0 }"
            >
              <NText :class="{ 'disabled-text': currentUser.status === 0 }">{{
                currentUser.remark
              }}</NText>
            </NCard>

            <!-- 操作按钮 -->
            <NSpace justify="center">
              <NButton
                type="primary"
                @click="showUserDetail = false"
              >
                关闭
              </NButton>
            </NSpace>
          </NSpace>
        </div>
      </NDrawerContent>
    </NDrawer>

    <!-- 添加/编辑用户弹窗 -->
    <NModal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      :positive-text="modalMode === 'add' ? '确认添加' : '确认修改'"
      negative-text="取消"
      @positive-click="handleSaveUser"
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
          <NGi>
            <NFormItem
              label="用户类型"
              path="userType"
            >
              <NSelect
                v-model:value="formData.userType"
                :options="userTypeOptions"
                placeholder="请选择用户类型"
                @update:value="handleUserTypeChange"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="用户名"
              path="username"
            >
              <NInput
                v-model:value="formData.username"
                placeholder="请输入用户名"
                :disabled="modalMode === 'edit'"
              >
                <template
                  #suffix
                  v-if="modalMode === 'edit'"
                >
                  <NTooltip>
                    <template #trigger>
                      <C_Icon
                        name="mdi:information"
                        :size="16"
                      />
                    </template>
                    用户名作为登录凭证，创建后不可修改
                  </NTooltip>
                </template>
              </NInput>
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="昵称"
              path="nickname"
            >
              <NInput
                v-model:value="formData.nickname"
                placeholder="请输入昵称"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="邮箱"
              path="email"
            >
              <NInput
                v-model:value="formData.email"
                placeholder="请输入邮箱"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="手机号"
              path="phone"
            >
              <NInput
                v-model:value="formData.phone"
                placeholder="请输入手机号"
              />
            </NFormItem>
          </NGi>

          <!-- 内部用户显示部门选择 -->
          <NGi v-if="formData.userType === 'internal'">
            <NFormItem
              label="所属部门"
              path="deptId"
            >
              <NTreeSelect
                v-model:value="formData.deptId"
                :options="deptTreeOptions"
                placeholder="请选择部门"
                clearable
                check-strategy="child"
                key-field="id"
                label-field="name"
                children-field="children"
              />
            </NFormItem>
          </NGi>

          <!-- 外部用户显示公司信息 -->
          <NGi v-if="formData.userType === 'external'">
            <NFormItem
              label="公司名称"
              path="companyName"
            >
              <NInput
                v-model:value="formData.companyName"
                placeholder="请输入公司名称"
              />
            </NFormItem>
          </NGi>

          <NGi v-if="formData.userType === 'external'">
            <NFormItem
              label="联系人"
              path="contactPerson"
            >
              <NInput
                v-model:value="formData.contactPerson"
                placeholder="请输入联系人"
              />
            </NFormItem>
          </NGi>

          <NGi>
            <NFormItem
              label="用户角色"
              path="roleIds"
            >
              <NSelect
                v-model:value="formData.roleIds"
                :options="filteredRoleOptions"
                placeholder="请选择角色"
                multiple
                clearable
              />
            </NFormItem>
          </NGi>

          <NGi v-if="modalMode === 'add'">
            <NFormItem
              label="初始密码"
              path="password"
            >
              <NInput
                v-model:value="formData.password"
                type="password"
                placeholder="请输入初始密码"
                show-password-on="click"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem
              label="用户状态"
              path="status"
            >
              <NSwitch
                v-model:value="formData.status"
                :checked-value="1"
                :unchecked-value="0"
              >
                <template #checked>正常</template>
                <template #unchecked>禁用</template>
              </NSwitch>
            </NFormItem>
          </NGi>
        </NGrid>

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

    <!-- 重置密码弹窗 -->
    <NModal
      v-model:show="showResetPasswordModal"
      preset="dialog"
      title="重置密码"
      positive-text="确认重置"
      negative-text="取消"
      @positive-click="handleResetPassword"
    >
      <NForm
        ref="resetPasswordFormRef"
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        label-placement="left"
        label-width="100px"
      >
        <NFormItem
          label="新密码"
          path="newPassword"
        >
          <NInput
            v-model:value="resetPasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password-on="click"
          />
        </NFormItem>
        <NFormItem
          label="确认密码"
          path="confirmPassword"
        >
          <NInput
            v-model:value="resetPasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password-on="click"
          />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import type { FormInst, DataTableColumns } from 'naive-ui/es'
  import { Icon } from '@iconify/vue'
  import C_Tree from '@/components/global/C_Tree/index.vue'
  import {
    type UserData,
    type UserFormData,
    type DeptData,
    type DeptTreeOption,
    type SearchForm,
    type ResetPasswordForm,
    type UserType,
    USER_FORM_RULES,
    RESET_PASSWORD_RULES,
    DEFAULT_USER_FORM_DATA,
    DEFAULT_RESET_PASSWORD_FORM,
    getUserListApi,
    getDeptListApi,
    getUserRolesApi,
    MOCK_USER_DATA,
    MOCK_DEPT_DATA,
    MOCK_ROLE_DATA,
  } from './data'

  // 创建 C_Icon 组件
  const C_Icon = defineComponent({
    name: 'C_Icon',
    props: {
      name: {
        type: String,
        required: true,
      },
      size: {
        type: [String, Number],
        default: 16,
      },
      color: {
        type: String,
        default: '',
      },
    },
    /**
     * @description: 渲染组件
     */
    setup(props) {
      return () =>
        h(Icon, {
          icon: props.name,
          width: props.size,
          height: props.size,
          color: props.color,
        })
    },
  })

  const message = useMessage()
  const dialog = useDialog()

  // 响应式数据
  const loading = ref(false)
  const showModal = ref(false)
  const showUserDetail = ref(false)
  const showResetPasswordModal = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInst | null>(null)
  const resetPasswordFormRef = ref<FormInst | null>(null)
  const tableRef = ref()
  const deptTreeRef = ref<InstanceType<typeof C_Tree> | null>(null)
  const expandedDeptKeys = ref<string[]>([])
  const selectedDeptKeys = ref<string[]>([])
  const selectedUsers = ref<string[]>([])
  const isAllExpanded = ref(false)
  const currentUser = ref<UserData | null>(null)
  const currentResetUserId = ref<string>('')

  // 数据
  const userList = reactive<UserData[]>([])
  const deptList = reactive<DeptData[]>([])
  const userRoleOptions = ref<{ label: string; value: string }[]>([])

  // 表单数据
  const formData = reactive<UserFormData>({ ...DEFAULT_USER_FORM_DATA })
  const formRules = USER_FORM_RULES
  const resetPasswordForm = reactive<ResetPasswordForm>({
    ...DEFAULT_RESET_PASSWORD_FORM,
  })
  const resetPasswordRules = RESET_PASSWORD_RULES

  // 搜索表单
  const searchForm = reactive<SearchForm>({
    keyword: '',
    status: null,
    roleId: null,
    deptId: null,
    userType: null,
  })

  // 分页
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    showQuickJumper: true,
  })

  // 用户详情相关
  const defaultAvatar =
    'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'

  // ==================== 计算属性 ====================
  const modalTitle = computed(() =>
    modalMode.value === 'add' ? '新增用户' : '编辑用户'
  )

  const selectedDept = computed(() => {
    if (!selectedDeptKeys.value.length) return null
    return findDeptById(deptList, selectedDeptKeys.value[0])
  })

  const deptIconConfig = computed(() => ({
    typeMap: { dept: 'mdi:office-building', external: 'mdi:account-group' },
    colorMap: { dept: '#1890ff', external: '#52c41a' },
  }))

  // 合并选项配置
  const optionsConfig = computed(() => ({
    userType: [
      { label: '内部员工', value: 'internal' },
      { label: '外部客户', value: 'external' },
      { label: '合作伙伴', value: 'partner' },
      { label: '访客', value: 'guest' },
    ],
    userStatus: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 },
    ],
    filteredRoles:
      formData.userType === 'external'
        ? userRoleOptions.value.filter(role =>
            ['role_4', 'role_5'].includes(role.value)
          )
        : userRoleOptions.value,
  }))

  const userTypeOptions = computed(() => optionsConfig.value.userType)
  const userStatusOptions = computed(() => optionsConfig.value.userStatus)
  const filteredRoleOptions = computed(() => optionsConfig.value.filteredRoles)

  const deptTreeOptions = computed((): DeptTreeOption[] =>
    convertDeptListToTreeOptions(deptList)
  )

  const paginationReactive = computed(() => ({
    ...pagination,
    onChange: (page: number) => handlePageChange(page),
    onUpdatePageSize: (pageSize: number) => handlePageSizeChange(pageSize),
  }))

  // ==================== 辅助函数 ====================
  const getRoleNameById = (roleId: string): string => {
    return MOCK_ROLE_DATA.find(r => r.id === roleId)?.name || ''
  }

  const getDeptNameById = (deptId: string): string => {
    const findDeptName = (depts: DeptData[], id: string): string | null => {
      for (const dept of depts) {
        if (dept.id === id) return dept.name
        if (dept.children) {
          const found = findDeptName(dept.children, id)
          if (found) return found
        }
      }
      return null
    }
    return findDeptName(MOCK_DEPT_DATA, deptId) || '未知部门'
  }

  // 更新用户状态的通用函数
  const updateUserInList = (userId: string, updates: Partial<UserData>) => {
    // 更新MOCK_USER_DATA
    const mockUserIndex = MOCK_USER_DATA.findIndex(u => u.id === userId)
    if (mockUserIndex !== -1) {
      MOCK_USER_DATA[mockUserIndex] = {
        ...MOCK_USER_DATA[mockUserIndex],
        ...updates,
      }
    }

    // 更新本地userList
    const userIndex = userList.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      userList[userIndex] = { ...userList[userIndex], ...updates }
    }

    // 更新用户详情（如果打开）
    if (currentUser.value && currentUser.value.id === userId) {
      currentUser.value = { ...currentUser.value, ...updates }
    }
  }

  const getUserStatusConfig = (status: number) => {
    const configs = {
      1: { text: '正常', type: 'success' as const, icon: 'mdi:check-circle' },
      0: { text: '禁用', type: 'error' as const, icon: 'mdi:pause-circle' },
    }
    return configs[status as keyof typeof configs] || configs[1]
  }

  const getUserTypeConfig = (userType: UserType) => {
    const configs = {
      internal: { text: '内部', type: 'info' as const, icon: 'mdi:account' },
      external: {
        text: '外部',
        type: 'warning' as const,
        icon: 'mdi:account-group',
      },
      partner: {
        text: '伙伴',
        type: 'success' as const,
        icon: 'mdi:handshake',
      },
      guest: {
        text: '访客',
        type: 'default' as const,
        icon: 'mdi:account-outline',
      },
    }
    return configs[userType] || configs.internal
  }

  const getRowClassName = (row: UserData) => {
    return row.status === 0 ? 'disabled-row' : ''
  }

  const findDeptById = (depts: DeptData[], id: string): DeptData | null => {
    for (const dept of depts) {
      if (dept.id === id) return dept
      if (dept.children) {
        const found = findDeptById(dept.children, id)
        if (found) return found
      }
    }
    return null
  }

  const convertDeptListToTreeOptions = (
    depts: DeptData[]
  ): DeptTreeOption[] => {
    return depts.map(dept => ({
      id: dept.id,
      name: dept.name,
      children: dept.children
        ? convertDeptListToTreeOptions(dept.children)
        : undefined,
    }))
  }

  // ==================== 表格列配置 ====================
  const userColumns: DataTableColumns<UserData> = [
    { type: 'selection' },
    {
      title: '用户类型',
      key: 'userType',
      width: 100,
      render: row => {
        const config = getUserTypeConfig(row.userType)
        return h(
          NTag,
          {
            type: config.type,
            size: 'small',
            class: { 'disabled-tag': row.status === 0 },
          },
          {
            icon: () => h(C_Icon, { name: config.icon, size: 10 }),
            default: () => config.text,
          }
        )
      },
    },
    {
      title: '用户名',
      key: 'username',
      width: 120,
      fixed: 'left',
      render: row =>
        h(
          'div',
          {
            class: ['username-cell', { 'disabled-user': row.status === 0 }],
            style:
              row.status === 0
                ? {
                    textDecoration: 'line-through',
                    color: '#999',
                    backgroundColor: '#f5f5f5',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    border: '1px solid #e0e0e0',
                  }
                : undefined,
          },
          row.username
        ),
    },
    {
      title: '昵称',
      key: 'nickname',
      width: 120,
      render: row =>
        h(
          'div',
          {
            class: { 'disabled-text': row.status === 0 },
          },
          row.nickname
        ),
    },
    {
      title: '邮箱',
      key: 'email',
      width: 180,
      render: row =>
        h(
          'div',
          {
            class: { 'disabled-text': row.status === 0 },
          },
          row.email || '-'
        ),
    },
    {
      title: '手机号',
      key: 'phone',
      width: 120,
      render: row =>
        h(
          'div',
          {
            class: { 'disabled-text': row.status === 0 },
          },
          row.phone || '-'
        ),
    },
    {
      title: '部门/公司',
      key: 'deptName',
      width: 120,
      render: row =>
        h(
          'div',
          {
            class: { 'disabled-text': row.status === 0 },
          },
          row.userType === 'external'
            ? row.companyName || '-'
            : row.deptName || '-'
        ),
    },
    {
      title: '角色',
      key: 'roleNames',
      width: 150,
      render: row => {
        if (!row.roleNames || row.roleNames.length === 0) {
          return h('div', '-')
        }
        return h(
          NSpace,
          { size: 4 },
          {
            default: () =>
              row.roleNames!.map(role =>
                h(
                  NTag,
                  {
                    key: role,
                    size: 'small',
                    type: 'info',
                    class: { 'disabled-tag': row.status === 0 },
                  },
                  { default: () => role }
                )
              ),
          }
        )
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: row => {
        const config = getUserStatusConfig(row.status)
        return h(
          NTag,
          { type: config.type, size: 'small' },
          {
            icon: () => h(C_Icon, { name: config.icon, size: 10 }),
            default: () => config.text,
          }
        )
      },
    },
    {
      title: '创建时间',
      key: 'createTime',
      width: 160,
      render: row =>
        h(
          'div',
          {
            class: { 'disabled-text': row.status === 0 },
          },
          row.createTime
        ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: row =>
        h(
          'div',
          { style: { display: 'flex', gap: '4px', flexWrap: 'nowrap' } },
          [
            h(
              NButton,
              {
                size: 'tiny',
                type: 'info',
                onClick: () => handleViewUser(row),
              },
              {
                icon: () => h(C_Icon, { name: 'mdi:eye', size: 12 }),
                default: () => '详情',
              }
            ),
            h(
              NButton,
              {
                size: 'tiny',
                onClick: () => handleEditUser(row),
              },
              {
                icon: () => h(C_Icon, { name: 'mdi:pencil', size: 12 }),
                default: () => '编辑',
              }
            ),
            h(
              NButton,
              {
                size: 'tiny',
                type: row.status === 1 ? 'warning' : 'success',
                onClick: () => handleToggleUserStatus(row),
              },
              {
                icon: () =>
                  h(C_Icon, {
                    name: row.status === 1 ? 'mdi:pause' : 'mdi:play',
                    size: 12,
                  }),
                default: () => (row.status === 1 ? '禁用' : '启用'),
              }
            ),
            h(
              NButton,
              {
                size: 'tiny',
                type: 'warning',
                onClick: () => handleShowResetPassword(row),
                disabled: row.status === 0,
              },
              {
                icon: () => h(C_Icon, { name: 'mdi:key', size: 12 }),
                default: () => '重置',
              }
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => handleDeleteUser(row.id),
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'tiny',
                      type: 'error',
                    },
                    {
                      icon: () => h(C_Icon, { name: 'mdi:delete', size: 12 }),
                      default: () => '删除',
                    }
                  ),
                default: () => '确认删除该用户吗？',
              }
            ),
          ]
        ),
    },
  ]

  // ==================== 批量操作通用函数 ====================
  const handleBatchOperation = (
    type: 'delete' | 'toggle',
    title: string,
    content: string,
    confirmText: string,
    operation: () => void
  ) => {
    if (selectedUsers.value.length === 0) {
      message.warning('请先选择用户')
      return
    }

    dialog[type === 'delete' ? 'error' : 'warning']({
      title,
      content,
      positiveText: confirmText,
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          operation()
          message.success(`${type === 'delete' ? '批量删除' : '批量操作'}成功`)
          selectedUsers.value = []
          await loadUsers()
        } catch {
          message.error(`${type === 'delete' ? '批量删除' : '批量操作'}失败`)
        }
      },
    })
  }

  // ==================== 用户操作函数 ====================
  // 拆分添加用户函数
  const handleAddUserData = async (
    userData: UserFormData
  ): Promise<boolean> => {
    const existingUser = MOCK_USER_DATA.find(
      user => user.username === userData.username
    )
    if (existingUser) {
      message.error('用户名已存在')
      return false
    }

    const newUser: UserData = {
      id: `user_${Date.now()}`,
      username: userData.username,
      nickname: userData.nickname,
      email: userData.email || undefined,
      phone: userData.phone || undefined,
      userType: userData.userType,
      deptId: userData.deptId || undefined,
      deptName: userData.deptId ? getDeptNameById(userData.deptId) : undefined,
      roleIds: userData.roleIds,
      roleNames: userData.roleIds.map(id => getRoleNameById(id)),
      status: userData.status,
      remark: userData.remark || undefined,
      companyName: userData.companyName || undefined,
      contactPerson: userData.contactPerson || undefined,
      createTime: new Date().toLocaleString(),
    }

    MOCK_USER_DATA.push(newUser)
    message.success('添加成功')
    return true
  }

  // 拆分更新用户函数
  const handleUpdateUserData = async (
    userData: UserFormData
  ): Promise<boolean> => {
    if (!userData.id) {
      message.error('用户ID不存在')
      return false
    }

    const userIndex = MOCK_USER_DATA.findIndex(user => user.id === userData.id)
    if (userIndex === -1) {
      message.error('用户不存在')
      return false
    }

    const existingUser = MOCK_USER_DATA[userIndex]
    const updatedUser = buildUpdatedUser(existingUser, userData)

    MOCK_USER_DATA[userIndex] = updatedUser
    updateCurrentUserIfNeeded(userData.id, updatedUser)

    message.success('修改成功')
    return true
  }

  // 辅助函数：构建更新后的用户对象
  const buildUpdatedUser = (
    existingUser: UserData,
    userData: UserFormData
  ): UserData => {
    return {
      ...existingUser,
      nickname: userData.nickname,
      email: userData.email || undefined,
      phone: userData.phone || undefined,
      userType: userData.userType,
      deptId: userData.deptId || undefined,
      deptName: userData.deptId ? getDeptNameById(userData.deptId) : undefined,
      roleIds: userData.roleIds,
      roleNames: userData.roleIds.map(id => getRoleNameById(id)),
      status: userData.status,
      remark: userData.remark || undefined,
      companyName: userData.companyName || undefined,
      contactPerson: userData.contactPerson || undefined,
      updateTime: new Date().toLocaleString(),
    }
  }

  // 辅助函数：如果需要，更新当前用户详情
  const updateCurrentUserIfNeeded = (userId: string, updatedUser: UserData) => {
    if (currentUser.value && currentUser.value.id === userId) {
      currentUser.value = { ...updatedUser }
    }
  }

  // ==================== 事件处理函数 ====================
  const handleDeptSelect = (node: any, keys: (string | number)[]) => {
    selectedDeptKeys.value = keys.map(k => String(k))
    searchForm.deptId = keys.length > 0 ? String(keys[0]) : null
    handleSearch()
  }

  const handleSearch = () => {
    pagination.page = 1
    loadUsers()
  }

  const handleSelectionChange = (keys: string[]) => {
    selectedUsers.value = keys
  }

  const handlePageChange = (page: number) => {
    pagination.page = page
    loadUsers()
  }

  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    loadUsers()
  }

  const expandAll = () => {
    if (isAllExpanded.value) {
      deptTreeRef.value?.collapseAll()
      isAllExpanded.value = false
    } else {
      deptTreeRef.value?.expandAll()
      isAllExpanded.value = true
    }
  }

  const refreshData = async () => {
    await Promise.all([loadUsers(), loadDepts(), loadUserRoles()])
    message.success('刷新成功')
  }

  const handleUserTypeChange = (type: UserType) => {
    if (type === 'external') {
      formData.deptId = 'dept_external'
    } else if (type === 'internal') {
      formData.companyName = ''
      formData.contactPerson = ''
      formData.deptId = null
    }
    formData.roleIds = []
  }

  const handleAddUserModal = (deptId?: string) => {
    modalMode.value = 'add'
    Object.assign(formData, DEFAULT_USER_FORM_DATA)
    if (deptId) {
      formData.deptId = deptId
      if (deptId === 'dept_external') {
        formData.userType = 'external'
      }
    } else if (selectedDept.value) {
      formData.deptId = selectedDept.value.id
      if (selectedDept.value.id === 'dept_external') {
        formData.userType = 'external'
      }
    }
    showModal.value = true
  }

  const handleEditUser = (user: UserData) => {
    modalMode.value = 'edit'
    Object.assign(formData, {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email || '',
      phone: user.phone || '',
      userType: user.userType,
      deptId: user.deptId,
      roleIds: user.roleIds || [],
      status: user.status,
      remark: user.remark || '',
      companyName: user.companyName || '',
      contactPerson: user.contactPerson || '',
    })
    showModal.value = true
  }

  const handleViewUser = (user: UserData) => {
    currentUser.value = user
    showUserDetail.value = true
  }

  const handleToggleUserStatus = async (user: UserData) => {
    const newStatus = user.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'

    try {
      updateUserInList(user.id, {
        status: newStatus,
        updateTime: new Date().toLocaleString(),
      })

      message.success(`${statusText}成功`)
    } catch (error) {
      console.error('状态切换失败:', error)
      message.error(`${statusText}失败`)
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      const userIndex = MOCK_USER_DATA.findIndex(user => user.id === id)
      if (userIndex !== -1) {
        MOCK_USER_DATA.splice(userIndex, 1)
      }

      message.success('删除成功')
      await loadUsers()
    } catch {
      message.error('删除失败')
    }
  }

  const handleShowResetPassword = (user: UserData) => {
    if (user.status === 0) {
      message.warning('禁用用户无法重置密码')
      return
    }
    currentResetUserId.value = user.id
    Object.assign(resetPasswordForm, DEFAULT_RESET_PASSWORD_FORM)
    showResetPasswordModal.value = true
  }

  const handleResetPassword = async (): Promise<boolean> => {
    try {
      await resetPasswordFormRef.value?.validate()
      console.log(
        '重置密码:',
        currentResetUserId.value,
        resetPasswordForm.newPassword
      )

      message.success('密码重置成功')
      showResetPasswordModal.value = false
      return true
    } catch (error) {
      if (error instanceof Array) return false
      message.error('密码重置失败')
      return false
    }
  }

  const handleBatchToggleStatus = () => {
    handleBatchOperation(
      'toggle',
      '批量状态操作',
      `确认对选中的 ${selectedUsers.value.length} 个用户进行状态切换吗？`,
      '确认',
      () => {
        selectedUsers.value.forEach(id => {
          const user = MOCK_USER_DATA.find(u => u.id === id)
          if (user) {
            updateUserInList(id, {
              status: user.status === 1 ? 0 : 1,
              updateTime: new Date().toLocaleString(),
            })
          }
        })
      }
    )
  }

  const handleBatchDelete = () => {
    handleBatchOperation(
      'delete',
      '批量删除',
      `确认删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复！`,
      '确认删除',
      () => {
        selectedUsers.value.forEach(id => {
          const userIndex = MOCK_USER_DATA.findIndex(user => user.id === id)
          if (userIndex !== -1) {
            MOCK_USER_DATA.splice(userIndex, 1)
          }
        })
      }
    )
  }

  // 简化后的保存函数
  const handleSaveUser = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()

      const success =
        modalMode.value === 'add'
          ? await handleAddUserData(formData)
          : await handleUpdateUserData(formData)

      if (success) {
        showModal.value = false
        await loadUsers()
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
    Object.assign(formData, DEFAULT_USER_FORM_DATA)
  }

  // ==================== 数据加载 ====================
  const loadUsers = async () => {
    loading.value = true
    try {
      const params = {
        ...searchForm,
        page: pagination.page,
        pageSize: pagination.pageSize,
      }
      const response = await getUserListApi(params)
      userList.length = 0
      userList.push(...response.data.list)
      pagination.itemCount = response.data.total
    } catch {
      message.error('加载用户列表失败')
    } finally {
      loading.value = false
    }
  }

  const loadDepts = async () => {
    try {
      const response = await getDeptListApi()
      deptList.length = 0
      deptList.push(...response.data)
    } catch {
      message.error('加载部门列表失败')
    }
  }

  const loadUserRoles = async () => {
    try {
      const response = await getUserRolesApi()
      userRoleOptions.value = response.data.map(role => ({
        label: role.name,
        value: role.id,
      }))
    } catch {
      message.error('加载角色列表失败')
    }
  }

  // 生命周期
  onMounted(async () => {
    await Promise.all([loadUsers(), loadDepts(), loadUserRoles()])
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
