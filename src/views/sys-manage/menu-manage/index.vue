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
            <div class="i-mdi:magnify text-gray-400"></div>
          </template>
        </NInput>
      </div>
      <div class="action-buttons">
        <NButton
          type="primary"
          @click="handleAddMenu()"
        >
          <template #icon>
            <div class="i-mdi:plus"></div>
          </template>
          新增菜单
        </NButton>
        <NButton @click="expandAll">
          <template #icon>
            <div class="i-mdi:file-tree"></div>
          </template>
          {{ isAllExpanded ? '收起全部' : '展开全部' }}
        </NButton>
        <NButton @click="refreshMenus">
          <template #icon>
            <div class="i-mdi:refresh"></div>
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
            :data="filteredMenuList"
            :search-pattern="searchPattern"
            :searchable="false"
            :show-toolbar="false"
            :draggable="true"
            :show-line="true"
            key-field="id"
            label-field="name"
            children-field="children"
            icon-field="icon"
            :status-configs="menuStatusConfigs"
            :actions="menuActions"
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
                <div class="i-mdi:pencil"></div>
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
            <div class="i-mdi:menu text-6xl text-gray-300"></div>
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
                    <div
                      :class="getMenuTypeConfig(selectedMenu.type).icon"
                    ></div>
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
              <div
                v-if="selectedMenu.permission"
                class="info-item"
              >
                <span class="label">权限标识：</span>
                <NTag
                  type="warning"
                  size="small"
                  >{{ selectedMenu.permission }}</NTag
                >
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
                  <div class="i-mdi:plus"></div>
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
                    <div class="i-mdi:button-cursor text-orange-500 mr-2"></div>
                    {{ permission.name }}
                  </div>
                  <div class="permission-code">{{ permission.permission }}</div>
                </div>
                <div class="permission-actions">
                  <NButton
                    size="tiny"
                    @click="handleEditMenu(permission)"
                  >
                    <template #icon>
                      <div class="i-mdi:pencil"></div>
                    </template>
                  </NButton>
                  <NPopconfirm
                    @positive-click="handleDeleteMenu(permission.id)"
                  >
                    <template #trigger>
                      <NButton
                        size="tiny"
                        type="error"
                      >
                        <template #icon>
                          <div class="i-mdi:delete"></div>
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
              <div class="stat-item">
                <div class="stat-number">{{ childrenStats.buttons }}</div>
                <div class="stat-label">按钮</div>
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
                <div class="i-mdi:folder mr-2 text-blue-500"></div>
                目录
              </div>
            </NRadio>
            <NRadio value="menu">
              <div class="flex items-center">
                <div class="i-mdi:file-document mr-2 text-green-500"></div>
                菜单
              </div>
            </NRadio>
            <NRadio value="button">
              <div class="flex items-center">
                <div class="i-mdi:button-cursor mr-2 text-orange-500"></div>
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
            placeholder="请输入图标类名，如：i-mdi:menu"
          >
            <template #prefix>
              <div
                :class="formData.icon || 'i-mdi:menu'"
                class="text-gray-400"
              ></div>
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
  import type { FormInst, FormRules } from 'naive-ui/es/form'
  import type { TreeSelectOption } from 'naive-ui/es/tree-select'
  import C_Tree from '@/components/global/C_Tree/index.vue'

  // 类型定义
  type MenuType = 'directory' | 'menu' | 'button'

  interface MenuData {
    id: string
    name: string
    type: MenuType
    parentId: string | null
    path?: string
    component?: string
    icon?: string
    permission?: string
    sort: number
    status: number
    hidden: number
    remark?: string
    children?: MenuData[]
  }

  interface FormData {
    id?: string
    name: string
    type: MenuType
    parentId: string | null
    path: string
    component: string
    icon: string
    permission: string
    sort: number
    status: number
    hidden: number
    remark: string
  }

  interface ApiResponse<T = unknown> {
    code: string
    data: T
    msg: string
  }

  interface RouteConfig {
    path: string
    name: string
    component?: string
    meta: {
      icon?: string
      title: string
      hidden?: boolean
      permission?: string
      description?: string
    }
    children?: RouteConfig[]
  }

  // 定义拖拽信息类型
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

  // 表单数据
  const formData = reactive<FormData>({
    name: '',
    type: 'menu',
    parentId: null,
    path: '',
    component: '',
    icon: '',
    permission: '',
    sort: 0,
    status: 1,
    hidden: 0,
    remark: '',
  })

  // 表单验证规则 - 简化验证
  const formRules: FormRules = {
    name: [
      { required: true, message: '请输入菜单名称', trigger: ['input', 'blur'] },
    ],
    type: [
      {
        required: true,
        message: '请选择菜单类型',
        trigger: ['change', 'blur'],
      },
    ],
    sort: [
      {
        required: true,
        type: 'number',
        message: '请输入排序号',
        trigger: ['input', 'blur'],
      },
    ],
  }

  // 计算属性
  const modalTitle = computed(() =>
    modalMode.value === 'add' ? '新增菜单' : '编辑菜单'
  )

  const menuStatusConfigs = computed(() => [
    {
      field: 'status',
      values: {
        0: { text: '禁用', type: 'error' as const },
        1: { text: '', type: 'success' as const },
      },
    },
    {
      field: 'hidden',
      values: {
        0: { text: '', type: 'success' as const },
        1: { text: '隐藏', type: 'warning' as const },
      },
    },
  ])

  // 修复类型错误 - 移除不支持的 type
  const menuActions = computed(() => [
    {
      key: 'add',
      text: '新增子菜单',
      icon: 'i-mdi:plus',
      type: 'primary' as const,
    },
    { key: 'edit', text: '编辑', icon: 'i-mdi:pencil', type: 'info' as const },
    {
      key: 'delete',
      text: '删除',
      icon: 'i-mdi:delete',
      type: 'error' as const,
      confirm: '确认删除该菜单吗？',
    },
  ])

  const selectedMenu = computed(() => {
    if (selectedKeys.value.length === 0) return null
    return findMenuById(menuList.value, selectedKeys.value[0])
  })

  const buttonPermissions = computed(() => {
    if (!selectedMenu.value || selectedMenu.value.type !== 'menu') return []
    return (
      selectedMenu.value.children?.filter(child => child.type === 'button') ||
      []
    )
  })

  const childrenStats = computed(() => {
    if (
      !selectedMenu.value ||
      selectedMenu.value.type !== 'directory' ||
      !selectedMenu.value.children
    )
      return null

    const stats = { directories: 0, menus: 0, buttons: 0 }
    const countChildren = (children: MenuData[]) => {
      children.forEach(child => {
        stats[
          child.type === 'directory'
            ? 'directories'
            : child.type === 'menu'
              ? 'menus'
              : 'buttons'
        ]++
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

  // 搜索功能 - 简化实现
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
  const getMenuTypeText = (type: MenuType): string => {
    const typeMap: Record<MenuType, string> = {
      directory: '目录',
      menu: '菜单',
      button: '按钮',
    }
    return typeMap[type]
  }

  const getMenuTypeConfig = (type: MenuType) => {
    const configMap: Record<
      MenuType,
      { icon: string; color: 'info' | 'success' | 'warning' }
    > = {
      directory: { icon: 'i-mdi:folder', color: 'info' },
      menu: { icon: 'i-mdi:file-document', color: 'success' },
      button: { icon: 'i-mdi:button-cursor', color: 'warning' },
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

  // 拆分菜单创建函数，降低圈复杂度
  const determineMenuType = (route: RouteConfig): MenuType => {
    if (route.meta.permission && !route.component) return 'button'
    if (route.children?.length && route.component === 'layout')
      return 'directory'
    return 'menu'
  }

  const processIcon = (icon?: string): string | undefined => {
    if (!icon) return undefined
    return `i-mdi:${icon.replace(/[^a-zA-Z0-9-]/g, '-')}`
  }

  const generateMenuId = (route: RouteConfig): string => {
    return route.name || route.path.replace(/\//g, '-')
  }

  const processComponent = (component?: string): string | undefined => {
    return component === 'layout' ? undefined : component
  }

  const createBaseMenuData = (
    route: RouteConfig,
    parentId: string | null,
    sort: number
  ): MenuData => {
    return {
      id: generateMenuId(route),
      name: route.meta.title,
      type: determineMenuType(route),
      parentId,
      path: route.path,
      component: processComponent(route.component),
      icon: processIcon(route.meta.icon),
      permission: route.meta.permission,
      sort,
      status: 1,
      hidden: route.meta.hidden ? 1 : 0,
      remark: route.meta.description || '',
      children: undefined,
    }
  }

  const processChildren = (
    route: RouteConfig,
    menuId: string
  ): MenuData[] | undefined => {
    if (!route.children) return undefined
    return route.children.map((child, index) =>
      createMenuFromRoute(child, menuId, index + 1)
    )
  }

  // 重构后的菜单创建函数 - 大幅降低圈复杂度
  const createMenuFromRoute = (
    route: RouteConfig,
    parentId: string | null = null,
    sort: number = 0
  ): MenuData => {
    const menu = createBaseMenuData(route, parentId, sort)
    menu.children = processChildren(route, menu.id)
    return menu
  }

  // 事件处理 - 修复类型问题
  const handleNodeSelect = (node: any, keys: (string | number)[]) => {
    selectedKeys.value = keys.map(k => String(k))
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
      `已将 "${dragNode.name}" 移动到 "${node.name}" ${
        dropPosition === 'inside'
          ? '内部'
          : dropPosition === 'before'
            ? '前面'
            : '后面'
      }`
    )
    await loadMenus()
  }

  const handleAddFromTree = (parentNode?: any) => {
    const menuNode = parentNode as MenuData | undefined
    handleAddMenu(menuNode?.id)
  }

  // 修复展开收起方法 - 使用自定义实现
  const expandAll = (): void => {
    if (treeRef.value) {
      // 尝试调用 C_Tree 的方法，如果不存在则使用备用方案
      if (typeof treeRef.value.expandAll === 'function') {
        treeRef.value.expandAll()
        isAllExpanded.value = true
      } else if (typeof treeRef.value.collapseAll === 'function') {
        if (isAllExpanded.value) {
          treeRef.value.collapseAll()
          isAllExpanded.value = false
        } else {
          // 备用方案：手动设置展开的 keys
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
      } else {
        // 完全的备用方案
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

  const handleDeleteMenu = async (id: string): Promise<void> => {
    try {
      await deleteMenuApi(id)
      message.success('删除成功')
      await loadMenus()
    } catch {
      message.error('删除失败')
    }
  }

  const handleSaveMenu = async (): Promise<boolean> => {
    try {
      await formRef.value?.validate()

      if (modalMode.value === 'add') {
        await addMenuApi(formData)
        message.success('添加成功')
      } else {
        await updateMenuApi(formData)
        message.success('修改成功')
      }

      showModal.value = false
      await loadMenus()
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
    Object.assign(formData, {
      id: undefined,
      name: '',
      type: 'menu' as MenuType,
      parentId: null,
      path: '',
      component: '',
      icon: '',
      permission: '',
      sort: 0,
      status: 1,
      hidden: 0,
      remark: '',
    })
  }

  // API方法
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

  const getMenuListApi = async (): Promise<ApiResponse<MenuData[]>> => {
    const routeData: RouteConfig[] = [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: 'layout',
        meta: {
          icon: 'monitor-dashboard',
          title: '仪表盘',
          hidden: false,
          description: '系统数据统计和分析展示',
        },
        children: [
          {
            path: 'analysis',
            name: 'dashboard-analysis',
            component: '/dashboard/analysis/index',
            meta: {
              icon: 'google-analytics',
              title: '分析页',
              hidden: false,
              description: '数据分析和图表展示页面',
            },
            children: [
              {
                path: '',
                name: 'analysis-export',
                meta: {
                  title: '导出数据',
                  permission: 'dashboard:analysis:export',
                },
              },
              {
                path: '',
                name: 'analysis-refresh',
                meta: {
                  title: '刷新数据',
                  permission: 'dashboard:analysis:refresh',
                },
              },
              {
                path: '',
                name: 'analysis-print',
                meta: {
                  title: '打印报表',
                  permission: 'dashboard:analysis:print',
                },
              },
            ],
          },
          {
            path: 'workbench',
            name: 'dashboard-workbench',
            component: '/dashboard/workbench/index',
            meta: {
              icon: 'view-dashboard',
              title: '工作台',
              hidden: false,
              description: '个人工作台和快捷操作',
            },
            children: [
              {
                path: '',
                name: 'workbench-todo',
                meta: {
                  title: '待办事项',
                  permission: 'dashboard:workbench:todo',
                },
              },
              {
                path: '',
                name: 'workbench-message',
                meta: {
                  title: '消息通知',
                  permission: 'dashboard:workbench:message',
                },
              },
            ],
          },
        ],
      },
      {
        path: '/sys-manage',
        name: 'sys-manage',
        component: 'layout',
        meta: {
          icon: 'cog',
          title: '系统管理',
          hidden: false,
          description: '系统基础设置和权限管理',
        },
        children: [
          {
            path: 'menu-manage',
            name: 'sys-menu-manage',
            component: '/sys-manage/menu-manage/index',
            meta: {
              icon: 'menu',
              title: '菜单管理',
              hidden: false,
              description: '系统菜单配置和权限设置',
            },
            children: [
              {
                path: '',
                name: 'menu-add',
                meta: { title: '新增菜单', permission: 'sys:menu:add' },
              },
              {
                path: '',
                name: 'menu-edit',
                meta: { title: '编辑菜单', permission: 'sys:menu:edit' },
              },
              {
                path: '',
                name: 'menu-delete',
                meta: { title: '删除菜单', permission: 'sys:menu:delete' },
              },
            ],
          },
          {
            path: 'user-manage',
            name: 'sys-user-manage',
            component: '/sys-manage/user-manage/index',
            meta: {
              icon: 'account-group',
              title: '用户管理',
              hidden: false,
              description: '系统用户信息管理',
            },
            children: [
              {
                path: '',
                name: 'user-add',
                meta: { title: '添加用户', permission: 'sys:user:add' },
              },
              {
                path: '',
                name: 'user-edit',
                meta: { title: '编辑用户', permission: 'sys:user:edit' },
              },
              {
                path: '',
                name: 'user-delete',
                meta: { title: '删除用户', permission: 'sys:user:delete' },
              },
            ],
          },
          {
            path: 'role-manage',
            name: 'sys-role-manage',
            component: '/sys-manage/role-manage/index',
            meta: {
              icon: 'account-key',
              title: '角色管理',
              hidden: false,
              description: '系统角色和权限配置',
            },
            children: [
              {
                path: '',
                name: 'role-add',
                meta: { title: '添加角色', permission: 'sys:role:add' },
              },
              {
                path: '',
                name: 'role-edit',
                meta: { title: '编辑角色', permission: 'sys:role:edit' },
              },
              {
                path: '',
                name: 'role-delete',
                meta: { title: '删除角色', permission: 'sys:role:delete' },
              },
            ],
          },
        ],
      },
      {
        path: '/content',
        name: 'content',
        component: 'layout',
        meta: {
          icon: 'file-document-multiple',
          title: '内容管理',
          hidden: false,
          description: '文章、资讯等内容管理',
        },
        children: [
          {
            path: 'article',
            name: 'content-article',
            component: '/content/article/index',
            meta: {
              icon: 'file-document',
              title: '文章管理',
              hidden: false,
              description: '文章内容的发布和管理',
            },
            children: [
              {
                path: '',
                name: 'article-add',
                meta: { title: '新增文章', permission: 'content:article:add' },
              },
              {
                path: '',
                name: 'article-edit',
                meta: { title: '编辑文章', permission: 'content:article:edit' },
              },
              {
                path: '',
                name: 'article-delete',
                meta: {
                  title: '删除文章',
                  permission: 'content:article:delete',
                },
              },
            ],
          },
          {
            path: 'category',
            name: 'content-category',
            component: '/content/category/index',
            meta: {
              icon: 'folder-multiple',
              title: '分类管理',
              hidden: false,
              description: '内容分类配置管理',
            },
            children: [
              {
                path: '',
                name: 'category-add',
                meta: { title: '添加分类', permission: 'content:category:add' },
              },
              {
                path: '',
                name: 'category-edit',
                meta: {
                  title: '编辑分类',
                  permission: 'content:category:edit',
                },
              },
              {
                path: '',
                name: 'category-delete',
                meta: {
                  title: '删除分类',
                  permission: 'content:category:delete',
                },
              },
            ],
          },
        ],
      },
    ]

    return new Promise(resolve => {
      setTimeout(() => {
        const menuData = routeData.map((route, index) =>
          createMenuFromRoute(route, null, index + 1)
        )
        resolve({ code: '0', data: menuData, msg: '成功' })
      }, 800)
    })
  }

  // 简化的API方法
  const addMenuApi = async (data: FormData): Promise<void> => {
    console.log('添加菜单:', data)
    return new Promise(resolve => setTimeout(resolve, 500))
  }

  const updateMenuApi = async (data: FormData): Promise<void> => {
    console.log('更新菜单:', data)
    return new Promise(resolve => setTimeout(resolve, 500))
  }

  const deleteMenuApi = async (id: string): Promise<void> => {
    console.log('删除菜单:', id)
    return new Promise(resolve => setTimeout(resolve, 500))
  }

  // 生命周期
  onMounted(() => {
    loadMenus()
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
