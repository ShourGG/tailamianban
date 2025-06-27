<template>
  <div class="menu-management">
    <!-- 搜索和操作栏 -->
    <div class="header-actions">
      <div class="search-section">
        <NInput
          v-model:value="searchPattern"
          placeholder="搜索菜单名称"
          clearable
          class="search-input"
        >
          <template #prefix>
            <C_Icon
              name="mdi:magnify"
              :size="16"
              color="#9CA3AF"
            />
          </template>
        </NInput>
      </div>
      <div class="action-buttons">
        <NButton
          type="primary"
          @click="handleAddMenu()"
        >
          <template #icon>
            <C_Icon
              name="mdi:plus"
              :size="16"
            />
          </template>
          新增菜单
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
        <NButton @click="refreshMenus">
          <template #icon>
            <C_Icon
              name="mdi:refresh"
              :size="16"
            />
          </template>
          刷新
        </NButton>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧菜单树 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3 class="panel-title">菜单结构</h3>
        </div>
        <div class="tree-container">
          <C_Tree
            ref="treeRef"
            mode="menu"
            :data="filteredMenuList"
            :search-pattern="searchPattern"
            :searchable="false"
            :show-toolbar="false"
            :status-configs="menuStatusConfigs"
            :default-expanded-keys="expandedKeys"
            :default-selected-keys="selectedKeys"
            @node-select="handleNodeSelect"
            @node-action="handleNodeAction"
            @node-drop="handleNodeDrop"
            @add="handleAddFromTree"
            class="menu-tree"
          />
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <div class="right-panel">
        <div class="panel-header">
          <h3 class="panel-title">
            {{
              selectedMenu
                ? `${getMenuTypeText(selectedMenu.type)} - ${selectedMenu.name}`
                : '选择菜单查看详情'
            }}
          </h3>
          <div
            v-if="selectedMenu"
            class="header-actions"
          >
            <NButton
              size="small"
              @click="handleEditMenu(selectedMenu)"
            >
              <template #icon>
                <C_Icon
                  name="mdi:pencil"
                  :size="14"
                />
              </template>
              编辑
            </NButton>
          </div>
        </div>

        <!-- 未选择状态 -->
        <div
          v-if="!selectedMenu"
          class="empty-state"
        >
          <div class="empty-icon">
            <C_Icon
              name="mdi:menu"
              :size="72"
              color="#D1D5DB"
            />
          </div>
          <p class="empty-text">请从左侧选择一个菜单节点查看详细信息</p>
        </div>

        <!-- 选中菜单详情 -->
        <div
          v-else
          class="detail-content"
        >
          <!-- 基本信息 -->
          <div class="info-section">
            <h4 class="section-title">基本信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">菜单名称：</span>
                <span class="value">{{ selectedMenu.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">菜单类型：</span>
                <NTag
                  :type="getMenuTypeConfig(selectedMenu.type).color"
                  size="small"
                >
                  <template #icon>
                    <C_Icon
                      :name="getMenuTypeConfig(selectedMenu.type).icon"
                      :size="12"
                    />
                  </template>
                  {{ getMenuTypeText(selectedMenu.type) }}
                </NTag>
              </div>
              <div
                v-if="selectedMenu.path"
                class="info-item"
              >
                <span class="label">路由路径：</span>
                <NTag
                  type="info"
                  size="small"
                  >{{ selectedMenu.path }}</NTag
                >
              </div>
              <div
                v-if="selectedMenu.component"
                class="info-item"
              >
                <span class="label">组件路径：</span>
                <span class="value">{{ selectedMenu.component }}</span>
              </div>
              <div class="info-item">
                <span class="label">排序：</span>
                <span class="value">{{ selectedMenu.sort }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态：</span>
                <NTag
                  :type="selectedMenu.status === 1 ? 'success' : 'error'"
                  size="small"
                >
                  {{ selectedMenu.status === 1 ? '启用' : '禁用' }}
                </NTag>
              </div>
              <div
                v-if="selectedMenu.type !== 'button'"
                class="info-item"
              >
                <span class="label">显示状态：</span>
                <NTag
                  :type="selectedMenu.hidden === 0 ? 'success' : 'warning'"
                  size="small"
                >
                  {{ selectedMenu.hidden === 0 ? '显示' : '隐藏' }}
                </NTag>
              </div>
            </div>
          </div>

          <!-- 按钮权限列表 -->
          <div
            v-if="selectedMenu.type === 'menu' && buttonPermissions.length > 0"
            class="permissions-section"
          >
            <div class="section-header">
              <h4 class="section-title">按钮权限</h4>
              <NButton
                size="small"
                type="primary"
                @click="handleAddPermission"
              >
                <template #icon>
                  <C_Icon
                    name="mdi:plus"
                    :size="14"
                  />
                </template>
                添加权限
              </NButton>
            </div>
            <div class="permissions-list">
              <div
                v-for="permission in buttonPermissions"
                :key="permission.id"
                class="permission-item"
              >
                <div class="permission-info">
                  <div class="permission-name">
                    <C_Icon
                      name="mdi:button-cursor"
                      :size="16"
                      color="#fa8c16"
                      class="mr-2"
                    />
                    {{ permission.name }}
                  </div>
                  <div class="permission-code">{{ permission.permission }}</div>
                </div>
                <div class="permission-actions">
                  <NButton
                    size="tiny"
                    @click="handleEditPermission(permission)"
                  >
                    <template #icon>
                      <C_Icon
                        name="mdi:pencil"
                        :size="12"
                      />
                    </template>
                  </NButton>
                  <NPopconfirm
                    @positive-click="handleDeletePermission(permission.id)"
                  >
                    <template #trigger>
                      <NButton
                        size="tiny"
                        type="error"
                      >
                        <template #icon>
                          <C_Icon
                            name="mdi:delete"
                            :size="12"
                          />
                        </template>
                      </NButton>
                    </template>
                    确认删除该权限吗？
                  </NPopconfirm>
                </div>
              </div>
            </div>
          </div>

          <!-- 子菜单统计 -->
          <div
            v-if="selectedMenu.type === 'directory' && childrenStats"
            class="stats-section"
          >
            <h4 class="section-title">子菜单统计</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ childrenStats.directories }}</div>
                <div class="stat-label">目录</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ childrenStats.menus }}</div>
                <div class="stat-label">菜单</div>
              </div>
            </div>
          </div>

          <!-- 备注信息 -->
          <div
            v-if="selectedMenu.remark"
            class="remark-section"
          >
            <h4 class="section-title">备注信息</h4>
            <div class="remark-content">{{ selectedMenu.remark }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑菜单弹窗 -->
    <NModal
      v-model:show="showModal"
      preset="dialog"
      :title="modalTitle"
      :positive-text="modalMode === 'add' ? '确认添加' : '确认修改'"
      negative-text="取消"
      @positive-click="handleSaveMenu"
      @negative-click="handleCancelModal"
      :style="{ width: '600px' }"
    >
      <NForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="100px"
        class="menu-form"
      >
        <NFormItem
          label="菜单类型"
          path="type"
        >
          <NRadioGroup v-model:value="formData.type">
            <NRadio value="directory">
              <div class="flex items-center">
                <C_Icon
                  name="mdi:folder"
                  :size="16"
                  color="#1890ff"
                  class="mr-2"
                />
                目录
              </div>
            </NRadio>
            <NRadio value="menu">
              <div class="flex items-center">
                <C_Icon
                  name="mdi:file-document"
                  :size="16"
                  color="#52c41a"
                  class="mr-2"
                />
                菜单
              </div>
            </NRadio>
            <NRadio value="button">
              <div class="flex items-center">
                <C_Icon
                  name="mdi:button-cursor"
                  :size="16"
                  color="#fa8c16"
                  class="mr-2"
                />
                按钮
              </div>
            </NRadio>
          </NRadioGroup>
        </NFormItem>

        <NFormItem
          label="菜单名称"
          path="name"
        >
          <NInput
            v-model:value="formData.name"
            placeholder="请输入菜单名称"
          />
        </NFormItem>

        <NFormItem
          label="父级菜单"
          path="parentId"
        >
          <NTreeSelect
            v-model:value="formData.parentId"
            :options="parentMenuOptions"
            placeholder="请选择父级菜单"
            clearable
            key-field="id"
            label-field="name"
            children-field="children"
          />
        </NFormItem>

        <NFormItem
          v-if="formData.type !== 'button'"
          label="路由路径"
          path="path"
        >
          <NInput
            v-model:value="formData.path"
            placeholder="请输入路由路径，如：/system/menu"
          />
        </NFormItem>

        <NFormItem
          v-if="formData.type === 'menu'"
          label="组件路径"
          path="component"
        >
          <NInput
            v-model:value="formData.component"
            placeholder="请输入组件路径，如：system/menu/index"
          />
        </NFormItem>

        <NFormItem
          label="图标"
          path="icon"
        >
          <NInput
            v-model:value="formData.icon"
            placeholder="请输入图标名称，如：mdi:menu"
          >
            <template #prefix>
              <C_Icon
                :name="formData.icon || 'mdi:menu'"
                :size="16"
                color="#9CA3AF"
              />
            </template>
          </NInput>
        </NFormItem>

        <NFormItem
          v-if="formData.type === 'button'"
          label="权限标识"
          path="permission"
        >
          <NInput
            v-model:value="formData.permission"
            placeholder="请输入权限标识，如：system:menu:add"
          />
        </NFormItem>

        <NFormItem
          label="排序号"
          path="sort"
        >
          <NInputNumber
            v-model:value="formData.sort"
            placeholder="排序号"
            :min="0"
            :max="9999"
            style="width: 100%"
          />
        </NFormItem>

        <NFormItem
          label="菜单状态"
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
          v-if="formData.type !== 'button'"
          label="是否隐藏"
          path="hidden"
        >
          <NSwitch
            v-model:value="formData.hidden"
            :checked-value="1"
            :unchecked-value="0"
          >
            <template #checked>隐藏</template>
            <template #unchecked>显示</template>
          </NSwitch>
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
  import type { FormInst, TreeSelectOption } from 'naive-ui/es'
  import C_Tree from '@/components/global/C_Tree/index.vue'

  // 从 data.ts 导入类型和数据配置
  import {
    type MenuData,
    type FormData,
    type ButtonPermission,
    FORM_RULES,
    MENU_STATUS_CONFIGS,
    DEFAULT_FORM_DATA,
    getMenuListApi,
    getButtonPermissionsApi,
    addMenuApi,
    updateMenuApi,
    deleteMenuApi,
    addButtonPermissionApi,
    updateButtonPermissionApi,
    deleteButtonPermissionApi,
  } from './data'

  interface DropInfo {
    node: any
    dragNode: any
    dropPosition: 'before' | 'inside' | 'after'
    event: DragEvent
  }

  const message = useMessage()

  // 响应式数据
  const loading = ref(false)
  const searchPattern = ref('')
  const showModal = ref(false)
  const modalMode = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInst | null>(null)
  const treeRef = ref<InstanceType<typeof C_Tree> | null>(null)
  const expandedKeys = ref<string[]>([])
  const selectedKeys = ref<string[]>([])
  const isAllExpanded = ref(false)
  const menuList = ref<MenuData[]>([])
  const selectedMenuButtonPermissions = ref<ButtonPermission[]>([])

  // 表单数据
  const formData = reactive<FormData>({ ...DEFAULT_FORM_DATA })

  // 表单验证规则
  const formRules = FORM_RULES

  // 计算属性
  const modalTitle = computed(() =>
    modalMode.value === 'add' ? '新增菜单' : '编辑菜单'
  )
  const menuStatusConfigs = computed(() => MENU_STATUS_CONFIGS)

  const selectedMenu = computed(() => {
    if (selectedKeys.value.length === 0) return null
    return findMenuById(menuList.value, selectedKeys.value[0])
  })

  const buttonPermissions = computed(() => selectedMenuButtonPermissions.value)

  const childrenStats = computed(() => {
    if (
      !selectedMenu.value ||
      selectedMenu.value.type !== 'directory' ||
      !selectedMenu.value.children
    )
      return null

    const stats = { directories: 0, menus: 0 }
    const countChildren = (children: MenuData[]) => {
      children.forEach(child => {
        if (child.type === 'directory') stats.directories++
        else if (child.type === 'menu') stats.menus++
        if (child.children) countChildren(child.children)
      })
    }

    countChildren(selectedMenu.value.children)
    return stats
  })

  const parentMenuOptions = computed((): TreeSelectOption[] => {
    const buildOptions = (menus: MenuData[]): TreeSelectOption[] => {
      return menus
        .filter(menu => menu.type !== 'button')
        .map(menu => ({
          id: menu.id,
          name: menu.name,
          children: menu.children ? buildOptions(menu.children) : undefined,
        }))
    }
    return [{ id: null, name: '根目录' }, ...buildOptions(menuList.value)]
  })

  const filteredMenuList = computed(() => {
    if (!searchPattern.value.trim()) return menuList.value

    const filterMenu = (menu: MenuData): MenuData | null => {
      const matchesKeyword = menu.name
        .toLowerCase()
        .includes(searchPattern.value.toLowerCase())
      const filteredChildren =
        (menu.children?.map(filterMenu).filter(Boolean) as MenuData[]) || []

      if (matchesKeyword || filteredChildren.length > 0) {
        return { ...menu, children: filteredChildren }
      }
      return null
    }

    return menuList.value.map(filterMenu).filter(Boolean) as MenuData[]
  })

  // 工具函数
  const getMenuTypeText = (type: 'directory' | 'menu' | 'button'): string => {
    const typeMap = {
      directory: '目录',
      menu: '菜单',
      button: '按钮',
    }
    return typeMap[type]
  }

  const getMenuTypeConfig = (type: 'directory' | 'menu' | 'button') => {
    const configMap = {
      directory: { icon: 'mdi:folder', color: 'info' as const },
      menu: { icon: 'mdi:file-document', color: 'success' as const },
      button: { icon: 'mdi:button-cursor', color: 'warning' as const },
    }
    return configMap[type]
  }

  const findMenuById = (menus: MenuData[], id: string): MenuData | null => {
    for (const menu of menus) {
      if (menu.id === id) return menu
      if (menu.children) {
        const found = findMenuById(menu.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 事件处理
  const handleNodeSelect = async (node: any, keys: (string | number)[]) => {
    selectedKeys.value = keys.map(k => String(k))

    if (selectedMenu.value && selectedMenu.value.type === 'menu') {
      try {
        const response = await getButtonPermissionsApi(selectedMenu.value.id)
        selectedMenuButtonPermissions.value = response.data
      } catch (error) {
        console.error('获取按钮权限失败:', error)
        selectedMenuButtonPermissions.value = []
      }
    } else {
      selectedMenuButtonPermissions.value = []
    }
  }

  const handleNodeAction = (action: string, node: any) => {
    const menuNode = node as MenuData
    if (action === 'edit') {
      handleEditMenu(menuNode)
    } else if (action === 'delete') {
      handleDeleteMenu(menuNode.id)
    } else if (action === 'add') {
      handleAddMenu(menuNode.id)
    }
  }

  const handleNodeDrop = async (info: DropInfo) => {
    const { node, dragNode, dropPosition } = info
    message.success(
      `已将 "${dragNode.name}" 移动到 "${node.name}" ${dropPosition === 'inside' ? '内部' : dropPosition === 'before' ? '前面' : '后面'}`
    )
    await loadMenus()
  }

  const handleAddFromTree = (parentNode?: any) => {
    const menuNode = parentNode as MenuData | undefined
    handleAddMenu(menuNode?.id)
  }

  const expandAll = (): void => {
    if (isAllExpanded.value) {
      expandedKeys.value = []
      isAllExpanded.value = false
    } else {
      const getAllKeys = (menus: MenuData[]): string[] => {
        const keys: string[] = []
        menus.forEach(menu => {
          keys.push(menu.id)
          if (menu.children) {
            keys.push(...getAllKeys(menu.children))
          }
        })
        return keys
      }
      expandedKeys.value = getAllKeys(menuList.value)
      isAllExpanded.value = true
    }
  }

  const refreshMenus = async (): Promise<void> => {
    await loadMenus()
    message.success('刷新成功')
  }

  const handleAddMenu = (parentId?: string): void => {
    modalMode.value = 'add'
    resetFormData()
    if (parentId) formData.parentId = parentId
    showModal.value = true
  }

  const handleAddPermission = (): void => {
    if (!selectedMenu.value) return
    modalMode.value = 'add'
    resetFormData()
    formData.type = 'button'
    formData.parentId = selectedMenu.value.id
    showModal.value = true
  }

  const handleEditMenu = (menu: MenuData): void => {
    modalMode.value = 'edit'
    Object.assign(formData, {
      id: menu.id,
      name: menu.name,
      type: menu.type,
      parentId: menu.parentId,
      path: menu.path || '',
      component: menu.component || '',
      icon: menu.icon || '',
      permission: menu.permission || '',
      sort: menu.sort,
      status: menu.status,
      hidden: menu.hidden,
      remark: menu.remark || '',
    })
    showModal.value = true
  }

  const handleEditPermission = (permission: ButtonPermission): void => {
    modalMode.value = 'edit'
    Object.assign(formData, {
      id: permission.id,
      name: permission.name,
      type: 'button' as const,
      parentId: permission.menuId,
      path: '',
      component: '',
      icon: 'mdi:button-cursor',
      permission: permission.permission,
      sort: 0,
      status: 1,
      hidden: 0,
      remark: permission.remark || '',
    })
    showModal.value = true
  }

  const handleDeleteMenu = async (id: string): Promise<void> => {
    try {
      await deleteMenuApi(id)
      message.success('删除成功')
      await loadMenus()
    } catch {
      message.error('删除失败')
    }
  }

  const handleDeletePermission = async (id: string): Promise<void> => {
    try {
      await deleteButtonPermissionApi(id)
      message.success('删除权限成功')
      if (selectedMenu.value) {
        const response = await getButtonPermissionsApi(selectedMenu.value.id)
        selectedMenuButtonPermissions.value = response.data
      }
    } catch {
      message.error('删除权限失败')
    }
  }

  const handleSaveMenu = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()

      if (formData.type === 'button') {
        const permissionData = {
          id: formData.id,
          menuId: formData.parentId!,
          name: formData.name,
          permission: formData.permission,
          remark: formData.remark,
        }

        if (modalMode.value === 'add') {
          await addButtonPermissionApi(permissionData)
          message.success('添加权限成功')
        } else {
          await updateButtonPermissionApi(permissionData as ButtonPermission)
          message.success('修改权限成功')
        }

        if (selectedMenu.value) {
          const response = await getButtonPermissionsApi(selectedMenu.value.id)
          selectedMenuButtonPermissions.value = response.data
        }
      } else {
        if (modalMode.value === 'add') {
          await addMenuApi(formData)
          message.success('添加成功')
        } else {
          await updateMenuApi(formData)
          message.success('修改成功')
        }
        await loadMenus()
      }

      showModal.value = false
      return true
    } catch (error) {
      if (error instanceof Array) return false
      message.error('保存失败')
      return false
    }
  }

  const handleCancelModal = (): void => {
    showModal.value = false
    resetFormData()
  }

  const resetFormData = (): void => {
    Object.assign(formData, DEFAULT_FORM_DATA)
  }

  const loadMenus = async (): Promise<void> => {
    loading.value = true
    try {
      const response = await getMenuListApi()
      menuList.value = response.data
    } catch {
      message.error('加载菜单失败')
    } finally {
      loading.value = false
    }
  }

  // 生命周期
  onMounted(() => {
    loadMenus()
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
