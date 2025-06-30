<template>
  <div class="role-management">
    <!-- 搜索和操作栏 -->
    <NCard class="header-card">
      <NSpace justify="space-between" align="center">
        <NSpace>
          <NInput
            v-model:value="searchForm.keyword"
            placeholder="搜索角色名称、编码、描述"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <C_Icon :name="COMPONENT_CONFIG.icons.search" :size="16" />
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
          <NButton type="primary" @click="handleAddRoleModal()">
            <template #icon>
              <C_Icon :name="COMPONENT_CONFIG.icons.plus" :size="16" />
            </template>
            新增角色
          </NButton>
          <NButton @click="refreshData">
            <template #icon>
              <C_Icon :name="COMPONENT_CONFIG.icons.refresh" :size="16" />
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
          <NSpace justify="space-between" align="center">
            <NText>
              角色列表
              <NTag type="info" size="small" style="margin-left: 8px">
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
                  <C_Icon :name="COMPONENT_CONFIG.icons.toggle" :size="14" />
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
                  <C_Icon :name="COMPONENT_CONFIG.icons.delete" :size="14" />
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
          :row-key="(row) => row.id"
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
    <NDrawer v-model:show="showRoleDetail" :width="600" placement="right">
      <NDrawerContent title="角色详情" closable>
        <div class="role-detail" v-if="currentRole">
          <NSpace vertical :size="24">
            <!-- 基本信息 -->
            <NCard
              title="基本信息"
              size="small"
              :class="{ 'disabled-card': currentRole.status === 0 }"
            >
              <NGrid :cols="2" :x-gap="16" :y-gap="12">
                <NGi
                  v-for="field in getRoleDetailFields(currentRole)"
                  :key="field.key"
                >
                  <NSpace align="center">
                    <NText depth="3">{{ field.label }}：</NText>
                    <component :is="field.component" v-bind="field.props">
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
              v-if="currentRole.permissionNames && currentRole.permissionNames.length > 0"
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
                    <C_Icon :name="COMPONENT_CONFIG.icons.permission" :size="12" />
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
              <NGrid :cols="1" :y-gap="12">
                <NGi
                  v-for="timeField in getTimeFields(currentRole)"
                  :key="timeField.key"
                >
                  <NSpace align="center">
                    <NText depth="3">{{ timeField.label }}：</NText>
                    <NText :class="{ 'disabled-text': currentRole.status === 0 }">
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
              <NButton type="primary" @click="showRoleDetail = false">关闭</NButton>
            </NSpace>
          </NSpace>
        </div>
      </NDrawerContent>
    </NDrawer>

    <!-- 简化的添加/编辑角色弹窗 -->
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
        <NGrid :cols="2" :x-gap="16">
          <!-- 基础表单字段 -->
          <NGi v-for="field in getFormFields()" :key="field.key">
            <NFormItem :label="field.label" :path="field.path" v-if="field.condition">
              <component
                :is="field.component"
                v-bind="field.props"
                v-model:value="formData[field.key]"
              />
            </NFormItem>
          </NGi>
        </NGrid>

        <NFormItem label="备注" path="remark">
          <NInput
            v-model:value="formData.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </NFormItem>
      </NForm>
    </NModal>

    <!-- 权限分配抽屉 - 树形卡片布局 -->
    <NDrawer 
      v-model:show="showPermissionDrawer" 
      :width="1600" 
      placement="right"
      :mask-closable="false"
    >
      <NDrawerContent closable>
        <template #header>
          <div class="permission-header-new">
            <div class="header-info">
              <C_Icon name="mdi:shield-key-outline" :size="24" />
              <div>
                <h3>权限分配</h3>
                <p>{{ permissionRole?.name }} - {{ permissionRole?.description || '角色权限管理' }}</p>
              </div>
            </div>
            <div class="header-actions">
              <NSpace>
                <NBadge :value="selectedPermissionIds.length" :max="999" type="success">
                  <NButton type="primary" size="large" @click="handleSavePermissions">
                    <template #icon>
                      <C_Icon name="mdi:content-save" :size="16" />
                    </template>
                    保存配置 ({{ selectedPermissionIds.length }})
                  </NButton>
                </NBadge>
                <NButton @click="showPermissionDrawer = false">取消</NButton>
              </NSpace>
            </div>
          </div>
        </template>

        <div class="tree-permission-layout">
          <!-- 顶部工具栏 -->
          <div class="permission-toolbar">
            <div class="toolbar-left">
              <NInput
                v-model:value="permissionSearchKeyword"
                placeholder="搜索权限名称、编码或描述..."
                clearable
                size="large"
                style="width: 350px"
              >
                <template #prefix>
                  <C_Icon name="mdi:magnify" :size="18" />
                </template>
              </NInput>
              
              <NSelect
                v-model:value="selectedPermissionType"
                placeholder="权限类型"
                clearable
                style="width: 120px"
                :options="permissionTypeOptions"
                @update:value="handlePermissionTypeFilter"
              />

              <NCheckbox
                :checked="expandAll"
                @update:checked="handleToggleExpandAll"
              >
                {{ expandAll ? '收起全部' : '展开全部' }}
              </NCheckbox>
            </div>

            <div class="toolbar-right">
              <NSpace>
                <NButtonGroup>
                  <NButton @click="handleSelectAllPermissions" type="primary" ghost>
                    <template #icon>
                      <C_Icon name="mdi:checkbox-multiple-marked" :size="16" />
                    </template>
                    全选
                  </NButton>
                  <NButton @click="handleClearAllPermissions">
                    <template #icon>
                      <C_Icon name="mdi:checkbox-multiple-blank" :size="16" />
                    </template>
                    清空
                  </NButton>
                </NButtonGroup>
                
                <NButton type="primary" ghost @click="showPermissionTemplate = true">
                  <template #icon>
                    <C_Icon name="mdi:bookmark-multiple" :size="16" />
                  </template>
                  快速模板
                </NButton>
              </NSpace>
            </div>
          </div>

          <!-- 统计信息栏 -->
          <div class="permission-stats">
            <NSpace align="center">
              <div class="stat-item">
                <span class="stat-label">全部权限:</span>
                <span class="stat-value">{{ totalPermissionsCount }}</span>
              </div>
              <NDivider vertical />
              <div class="stat-item">
                <span class="stat-label">已选权限:</span>
                <span class="stat-value highlight">{{ selectedPermissionIds.length }}</span>
              </div>
              <NDivider vertical />
              <div class="stat-item">
                <span class="stat-label">覆盖模块:</span>
                <span class="stat-value">{{ selectedModulesCount }}</span>
              </div>
              <NDivider vertical />
              <div class="stat-item">
                <span class="stat-label">菜单权限:</span>
                <span class="stat-value">{{ getSelectedCountByType('menu') }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">按钮权限:</span>
                <span class="stat-value">{{ getSelectedCountByType('button') }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">接口权限:</span>
                <span class="stat-value">{{ getSelectedCountByType('api') }}</span>
              </div>
            </NSpace>
          </div>

          <!-- 树形权限选择区域 -->
          <div class="tree-permissions-container">
            <div 
              v-for="module in filteredModules" 
              :key="module.id"
              class="permission-module-tree"
            >
              <!-- 模块头部 -->
              <div class="module-header-tree">
                <div class="module-info">
                  <div class="module-title-section">
                    <NButton 
                      text 
                      @click="toggleModuleExpand(module.id)"
                      class="expand-button"
                    >
                      <template #icon>
                        <C_Icon 
                          :name="moduleExpandState[module.id] ? 'mdi:chevron-down' : 'mdi:chevron-right'" 
                          :size="18" 
                        />
                      </template>
                    </NButton>
                    <C_Icon :name="module.icon || 'mdi:folder'" :size="20" />
                    <h4>{{ module.name }}</h4>
                    <NTag size="small" type="info">
                      {{ getModulePermissionCount(module) }} 权限
                    </NTag>
                  </div>
                  <p class="module-description">{{ module.description || '该模块的功能权限配置' }}</p>
                </div>
                
                <div class="module-controls">
                  <div class="module-progress">
                    <span class="progress-text">
                      {{ getModuleSelectedCount(module) }}/{{ getModulePermissionCount(module) }}
                    </span>
                    <NProgress 
                      type="line" 
                      :percentage="getModuleSelectionPercentage(module)"
                      :height="6"
                      :border-radius="3"
                      :show-indicator="false"
                      :color="getModuleProgressColor(module)"
                    />
                  </div>
                  <NCheckbox
                    :checked="isModuleFullySelected(module)"
                    :indeterminate="isModulePartiallySelected(module)"
                    @update:checked="(checked) => handleToggleModule(module, checked)"
                    size="large"
                  >
                    全选模块
                  </NCheckbox>
                </div>
              </div>

              <!-- 权限树形结构 -->
              <div v-if="moduleExpandState[module.id]">
                <div class="permission-tree-content">
                  <div 
                    v-for="permission in getModuleMenuPermissions(module)"
                    :key="permission.id"
                    class="permission-tree-node"
                  >
                    <!-- 菜单权限卡片 -->
                    <div 
                      class="permission-card-tree menu-permission"
                      :class="{ 
                        'selected': isPermissionSelected(permission.id),
                        'highlighted': isSearchMatch(permission),
                        'has-children': permission.children && permission.children.length > 0
                      }"
                      @click="handleTogglePermission(permission.id, !isPermissionSelected(permission.id))"
                    >
                      <div class="permission-card-header">
                        <div class="permission-main-section">
                          <div class="permission-checkbox-section">
                            <NCheckbox
                              :checked="isPermissionSelected(permission.id)"
                              :indeterminate="isMenuPermissionPartiallySelected(permission)"
                              @update:checked="(checked) => handleToggleMenuPermission(permission, checked)"
                              @click.stop
                              size="large"
                            />
                          </div>
                          <div class="permission-info-section">
                            <div class="permission-title">
                              <C_Icon name="mdi:menu" :size="16" />
                              <span class="permission-name">{{ permission.name }}</span>
                              <NTag size="tiny" type="primary" class="permission-type-tag">
                                菜单
                              </NTag>
                              <NTag 
                                v-if="permission.children && permission.children.length > 0"
                                size="tiny" 
                                type="info"
                                class="children-count-tag"
                              >
                                {{ permission.children.length }} 个子权限
                              </NTag>
                            </div>
                            <div class="permission-details">
                              <code class="permission-code">{{ permission.code }}</code>
                              <span 
                                class="permission-description" 
                                v-if="permission.description"
                              >
                                {{ permission.description }}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <!-- 展开/收起按钮 -->
                        <NButton 
                          v-if="permission.children && permission.children.length > 0"
                          text 
                          size="small"
                          @click.stop="togglePermissionExpand(permission.id)"
                          class="expand-child-button"
                        >
                          <template #icon>
                            <C_Icon 
                              :name="permissionExpandState[permission.id] ? 'mdi:chevron-down' : 'mdi:chevron-right'" 
                              :size="16" 
                            />
                          </template>
                        </NButton>
                      </div>

                      <!-- 选中状态指示器 -->
                      <div class="selection-indicator" v-if="isPermissionSelected(permission.id)">
                        <C_Icon name="mdi:check-circle" :size="18" />
                      </div>
                    </div>

                    <!-- 子权限列表 -->
                    <div 
                      v-if="permission.children && permission.children.length > 0 && permissionExpandState[permission.id]"
                      class="child-permissions-collapse"
                    >
                      <div class="child-permissions-grid">
                        <div 
                          v-for="childPermission in getFilteredChildPermissions(permission)"
                          :key="childPermission.id"
                          class="permission-card-tree child-permission"
                          :class="{ 
                            'selected': isPermissionSelected(childPermission.id),
                            'highlighted': isSearchMatch(childPermission),
                            'button-type': childPermission.type === 'button',
                            'api-type': childPermission.type === 'api'
                          }"
                          @click="handleTogglePermission(childPermission.id, !isPermissionSelected(childPermission.id))"
                        >
                          <div class="child-permission-content">
                            <div class="child-permission-header">
                              <NCheckbox
                                :checked="isPermissionSelected(childPermission.id)"
                                @update:checked="(checked) => handleTogglePermission(childPermission.id, checked)"
                                @click.stop
                                size="medium"
                              />
                              <div class="child-permission-info">
                                <div class="child-permission-title">
                                  <C_Icon 
                                    :name="childPermission.type === 'button' ? 'mdi:gesture-tap-button' : 'mdi:api'" 
                                    :size="14" 
                                  />
                                  <span class="child-permission-name">{{ childPermission.name }}</span>
                                  <NTag 
                                    size="tiny" 
                                    :type="getPermissionTypeColor(childPermission.type)"
                                    class="child-permission-type-tag"
                                  >
                                    {{ getPermissionTypeName(childPermission.type) }}
                                  </NTag>
                                </div>
                                <div class="child-permission-details">
                                  <code class="child-permission-code">{{ childPermission.code }}</code>
                                  <span 
                                    class="child-permission-description" 
                                    v-if="childPermission.description"
                                  >
                                    {{ childPermission.description }}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- 子权限选中指示器 -->
                          <div class="child-selection-indicator" v-if="isPermissionSelected(childPermission.id)">
                            <C_Icon name="mdi:check" :size="14" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部已选权限快速预览 -->
          <div class="selected-preview-tree" v-if="selectedPermissionIds.length > 0">
            <div class="preview-header">
              <h5>已选择的权限</h5>
              <div class="preview-controls">
                <NSpace>
                  <NButton 
                    text 
                    type="primary" 
                    @click="showDetailedPreview = !showDetailedPreview"
                    size="small"
                  >
                    {{ showDetailedPreview ? '收起' : '展开' }}详情
                    <template #icon>
                      <C_Icon 
                        :name="showDetailedPreview ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
                        :size="16" 
                      />
                    </template>
                  </NButton>
                  <NButton 
                    text 
                    type="error" 
                    @click="handleClearAllPermissions"
                    size="small"
                  >
                    <template #icon>
                      <C_Icon name="mdi:delete-sweep" :size="16" />
                    </template>
                    清空全部
                  </NButton>
                </NSpace>
              </div>
            </div>
            
            <div class="preview-content" v-if="showDetailedPreview">
              <div class="preview-tree-structure">
                <div 
                  v-for="group in selectedPermissionGroups.slice(0, 8)"
                  :key="group.module"
                  class="preview-module-tree"
                >
                  <div class="preview-group-header">
                    <C_Icon :name="group.icon" :size="16" />
                    <span class="group-name">{{ group.module }}</span>
                    <NTag size="tiny" type="primary">{{ group.permissions.length }}</NTag>
                  </div>
                  
                  <div class="preview-permissions-tree">
                    <!-- 菜单权限 -->
                    <div 
                      v-for="menuPerm in group.menuPermissions" 
                      :key="menuPerm.id"
                      class="preview-menu-item"
                    >
                      <div class="preview-menu-header">
                        <C_Icon name="mdi:menu" :size="12" />
                        <span class="menu-name">{{ menuPerm.name }}</span>
                        <NButton
                          text
                          type="error"
                          size="tiny"
                          @click="handleTogglePermission(menuPerm.id, false)"
                        >
                          <template #icon>
                            <C_Icon name="mdi:close" :size="10" />
                          </template>
                        </NButton>
                      </div>
                      
                      <!-- 该菜单下的子权限 -->
                      <div 
                        class="preview-child-permissions" 
                        v-if="group.childPermissionsByMenu && group.childPermissionsByMenu[menuPerm.id]"
                      >
                        <NTag
                          v-for="childPerm in group.childPermissionsByMenu[menuPerm.id].slice(0, 3)"
                          :key="childPerm.id"
                          size="tiny"
                          :type="getPermissionTypeColor(childPerm.type)"
                          closable
                          @close="handleTogglePermission(childPerm.id, false)"
                          class="child-preview-tag"
                        >
                          {{ childPerm.name }}
                        </NTag>
                        <NTag 
                          v-if="group.childPermissionsByMenu[menuPerm.id].length > 3" 
                          size="tiny" 
                          type="default"
                        >
                          +{{ group.childPermissionsByMenu[menuPerm.id].length - 3 }}
                        </NTag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="preview-summary" v-else>
              <NSpace>
                <NTag
                  v-for="group in selectedPermissionGroups.slice(0, 4)"
                  :key="group.module"
                  type="primary"
                  size="medium"
                >
                  {{ group.module }} ({{ group.permissions.length }})
                </NTag>
                <NTag v-if="selectedPermissionGroups.length > 4" type="default" size="medium">
                  +{{ selectedPermissionGroups.length - 4 }} 更多模块
                </NTag>
              </NSpace>
            </div>
          </div>
        </div>
      </NDrawerContent>
    </NDrawer>

    <!-- 权限模板弹窗 -->
    <NModal
      v-model:show="showPermissionTemplate"
      preset="dialog"
      title="选择权限模板"
      positive-text="应用模板"
      negative-text="取消"
      @positive-click="handleApplyPermissionTemplate"
      style="width: 600px"
    >
      <div class="permission-templates">
        <NGrid :cols="1" :y-gap="12">
          <NGi v-for="template in permissionTemplates" :key="template.id">
            <NCard
              size="small"
              :class="{ 'template-selected': selectedTemplate === template.id }"
              hoverable
              @click="selectedTemplate = template.id"
            >
              <template #header>
                <NSpace align="center">
                  <NRadio :checked="selectedTemplate === template.id" />
                  <C_Icon :name="template.icon" :size="18" />
                  <NText strong>{{ template.name }}</NText>
                  <NTag size="small" type="info">{{ template.permissions.length }} 项权限</NTag>
                </NSpace>
              </template>

              <NText depth="3">{{ template.description }}</NText>

              <template #footer>
                <NSpace size="small">
                  <NTag
                    v-for="perm in template.permissions.slice(0, 3)"
                    :key="perm"
                    size="small"
                    type="primary"
                  >
                    {{ getPermissionNameById(perm) }}
                  </NTag>
                  <NTag
                    v-if="template.permissions.length > 3"
                    size="small"
                    type="default"
                  >
                    +{{ template.permissions.length - 3 }}
                  </NTag>
                </NSpace>
              </template>
            </NCard>
          </NGi>
        </NGrid>
      </div>
    </NModal>

    <!-- 角色用户列表弹窗 -->
    <NModal
      v-model:show="showRoleUsers"
      preset="dialog"
      :title="`${currentRole?.name} - 用户列表`"
      positive-text="关闭"
      @positive-click="showRoleUsers = false"
      style="width: 800px"
    >
      <NDataTable
        :columns="roleUserColumns"
        :data="roleUserList"
        :pagination="{ pageSize: 10 }"
        size="small"
        striped
      />
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, h } from 'vue'
  import { useMessage, useDialog } from 'naive-ui'
  import { type FormInst, type DataTableColumns, NTag, NButton, NSpace, NTooltip, NPopconfirm } from 'naive-ui'
  import C_Icon from '@/components/global/C_Icon/index.vue'
  import {
    type RoleData,
    type RoleFormData,
    type PermissionData,
    type SearchForm,
    type RoleType,
    type RoleUserData,
    type PermissionTemplate,
    type PermissionType,
    ROLE_FORM_RULES,
    DEFAULT_ROLE_FORM_DATA,
    UI_CONFIG,
    PERMISSION_TEMPLATES,
    getRoleListApi,
    getPermissionListApi,
    getRoleUsersApi,
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
      custom: { text: '自定义', type: 'info' as const, icon: 'mdi:account-key' },
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

  // ==================== 权限分配相关数据 ====================
  const showPermissionDrawer = ref(false)
  const permissionRole = ref<RoleData | null>(null)
  const selectedPermissionIds = ref<string[]>([])
  const permissionSearchKeyword = ref('')
  const selectedPermissionType = ref<string | null>(null)
  const showDetailedPreview = ref(false)
  const showPermissionTemplate = ref(false)
  const selectedTemplate = ref<string | null>(null)
  const showRoleUsers = ref(false)
  const roleUserList = reactive<RoleUserData[]>([])
  const permissionTemplates = reactive<PermissionTemplate[]>([...PERMISSION_TEMPLATES])

  // 新增的响应式数据
  const expandAll = ref(false)
  const moduleExpandState = reactive<Record<string, boolean>>({})
  const permissionExpandState = reactive<Record<string, boolean>>({})

  // 权限类型选项
  const permissionTypeOptions = [
    { label: '菜单权限', value: 'menu' },
    { label: '按钮权限', value: 'button' },
    { label: '接口权限', value: 'api' }
  ]

  // ==================== 计算属性 ====================
  const modalTitle = computed(() => modalMode.value === 'add' ? '新增角色' : '编辑角色')

  const paginationReactive = computed(() => ({
    ...pagination,
    onChange: (page: number) => handlePageChange(page),
    onUpdatePageSize: (pageSize: number) => handlePageSizeChange(pageSize),
  }))

  const filteredModules = computed(() => {
    let modules = [...permissionList]
    
    // 按关键词搜索
    if (permissionSearchKeyword.value) {
      const keyword = permissionSearchKeyword.value.toLowerCase()
      modules = modules.filter(module => {
        const matchModule = module.name.toLowerCase().includes(keyword) ||
                           module.code.toLowerCase().includes(keyword)
        
        if (module.children) {
          const hasMatchingChild = module.children.some(child => 
            child.name.toLowerCase().includes(keyword) ||
            child.code.toLowerCase().includes(keyword) ||
            (child.children && child.children.some(grandChild =>
              grandChild.name.toLowerCase().includes(keyword) ||
              grandChild.code.toLowerCase().includes(keyword)
            ))
          )
          return matchModule || hasMatchingChild
        }
        
        return matchModule
      })
    }
    
    // 按权限类型过滤
    if (selectedPermissionType.value) {
      modules = modules.filter(module => {
        const hasMatchingType = (perms: PermissionData[]): boolean => {
          return perms.some(perm => {
            if (perm.type === selectedPermissionType.value) return true
            if (perm.children) return hasMatchingType(perm.children)
            return false
          })
        }
        return module.children ? hasMatchingType(module.children) : false
      })
    }
    
    return modules
  })

  const selectedPermissionGroups = computed(() => {
    const groups: Record<string, {
      module: string
      icon: string
      permissions: PermissionData[]
      menuPermissions: PermissionData[]
      childPermissionsByMenu: Record<string, PermissionData[]>
    }> = {}

    const permissionIds = selectedPermissionIds.value || []

    permissionIds.forEach(id => {
      const permission = findPermissionById(permissionList, id)
      if (permission) {
        const topLevel = findTopLevelPermission(permissionList, id)
        if (topLevel) {
          if (!groups[topLevel.name]) {
            groups[topLevel.name] = {
              module: topLevel.name,
              icon: topLevel.icon || 'mdi:folder',
              permissions: [],
              menuPermissions: [],
              childPermissionsByMenu: {}
            }
          }
          
          groups[topLevel.name].permissions.push(permission)
          
          // 分类权限
          if (permission.type === 'menu') {
            groups[topLevel.name].menuPermissions.push(permission)
          } else {
            // 找到这个子权限属于哪个菜单
            const parentMenu = findParentMenuPermission(topLevel, id)
            if (parentMenu) {
              if (!groups[topLevel.name].childPermissionsByMenu[parentMenu.id]) {
                groups[topLevel.name].childPermissionsByMenu[parentMenu.id] = []
              }
              groups[topLevel.name].childPermissionsByMenu[parentMenu.id].push(permission)
            }
          }
        }
      }
    })

    return Object.values(groups)
  })

  const totalPermissionsCount = computed(() => {
    return getAllPermissionIds(permissionList).length
  })

  const selectedModulesCount = computed(() => {
    return selectedPermissionGroups.value.length
  })

  // ==================== 新增的方法 ====================
  const getSelectedCountByType = (type: PermissionType) => {
    return selectedPermissionIds.value.filter(id => {
      const permission = findPermissionById(permissionList, id)
      return permission && permission.type === type
    }).length
  }

  const getModuleMenuPermissions = (module: PermissionData) => {
    if (!module.children) return []
    return module.children.filter(perm => perm.type === 'menu')
  }

  const getFilteredChildPermissions = (permission: PermissionData) => {
    if (!permission.children) return []
    
    let children = permission.children
    
    // 按权限类型过滤
    if (selectedPermissionType.value) {
      children = children.filter(child => child.type === selectedPermissionType.value)
    }
    
    // 按搜索关键词过滤
    if (permissionSearchKeyword.value) {
      const keyword = permissionSearchKeyword.value.toLowerCase()
      children = children.filter(child => 
        child.name.toLowerCase().includes(keyword) ||
        child.code.toLowerCase().includes(keyword) ||
        (child.description && child.description.toLowerCase().includes(keyword))
      )
    }
    
    return children
  }

  const isMenuPermissionPartiallySelected = (menuPermission: PermissionData) => {
    if (!menuPermission.children) return false
    
    const childIds = menuPermission.children.map(child => child.id)
    const selectedChildIds = childIds.filter(id => selectedPermissionIds.value.includes(id))
    
    return selectedChildIds.length > 0 && selectedChildIds.length < childIds.length
  }

  const handleToggleMenuPermission = (menuPermission: PermissionData, checked: boolean) => {
    // 先切换菜单权限本身
    handleTogglePermission(menuPermission.id, checked)
    
    // 然后处理子权限
    if (menuPermission.children) {
      const childIds = menuPermission.children.map(child => child.id)
      
      if (checked) {
        // 如果选中菜单，自动选中所有子权限
        const newIds = [...new Set([...selectedPermissionIds.value, ...childIds])]
        selectedPermissionIds.value = newIds
      } else {
        // 如果取消菜单，自动取消所有子权限
        selectedPermissionIds.value = selectedPermissionIds.value.filter(id => !childIds.includes(id))
      }
    }
  }

  const toggleModuleExpand = (moduleId: string) => {
    moduleExpandState[moduleId] = !moduleExpandState[moduleId]
  }

  const togglePermissionExpand = (permissionId: string) => {
    permissionExpandState[permissionId] = !permissionExpandState[permissionId]
  }

  const handleToggleExpandAll = (expanded: boolean) => {
    expandAll.value = expanded
    
    // 展开/收起所有模块
    permissionList.forEach(module => {
      moduleExpandState[module.id] = expanded
      
      // 展开/收起所有权限
      if (module.children) {
        module.children.forEach(permission => {
          if (permission.children && permission.children.length > 0) {
            permissionExpandState[permission.id] = expanded
          }
        })
      }
    })
  }

  const findParentMenuPermission = (module: PermissionData, childPermissionId: string): PermissionData | null => {
    if (!module.children) return null
    
    for (const permission of module.children) {
      if (permission.type === 'menu' && permission.children) {
        const found = permission.children.find(child => child.id === childPermissionId)
        if (found) return permission
      }
    }
    return null
  }

  // ==================== 权限分配方法 ====================
  const handlePermissionAssignment = (role: RoleData) => {
    permissionRole.value = role
    selectedPermissionIds.value = [...(role.permissionIds || [])]
    showPermissionDrawer.value = true
  }

  // 获取模块的所有权限
  const getModulePermissions = (module: PermissionData) => {
    const allPermissions: PermissionData[] = []
    
    const collectPermissions = (perms: PermissionData[]) => {
      perms.forEach(perm => {
        // 收集所有权限，包括菜单类型
        allPermissions.push(perm)
        if (perm.children) {
          collectPermissions(perm.children)
        }
      })
    }
    
    if (module.children) {
      collectPermissions(module.children)
    }
    
    // 按权限类型过滤
    if (selectedPermissionType.value) {
      return allPermissions.filter(perm => perm.type === selectedPermissionType.value)
    }
    
    return allPermissions
  }

  const getModulePermissionCount = (module: PermissionData): number => {
    return getModulePermissions(module).length
  }

  const getModuleSelectedCount = (module: PermissionData): number => {
    const modulePermissions = getModulePermissions(module)
    return modulePermissions.filter(p => selectedPermissionIds.value.includes(p.id)).length
  }

  const getModuleSelectionPercentage = (module: PermissionData) => {
    const total = getModulePermissionCount(module)
    const selected = getModuleSelectedCount(module)
    return total > 0 ? Math.round((selected / total) * 100) : 0
  }

  const getModuleProgressColor = (module: PermissionData) => {
    const percentage = getModuleSelectionPercentage(module)
    if (percentage === 0) return '#d9d9d9'
    if (percentage === 100) return '#52c41a'
    return '#1890ff'
  }

  const isModuleFullySelected = (module: PermissionData): boolean => {
    const modulePermissions = getModulePermissions(module)
    return modulePermissions.length > 0 && 
           modulePermissions.every(p => selectedPermissionIds.value.includes(p.id))
  }

  const isModulePartiallySelected = (module: PermissionData): boolean => {
    const modulePermissions = getModulePermissions(module)
    const selectedCount = modulePermissions.filter(p => selectedPermissionIds.value.includes(p.id)).length
    return selectedCount > 0 && selectedCount < modulePermissions.length
  }

  const isPermissionSelected = (permissionId: string): boolean => {
    return selectedPermissionIds.value.includes(permissionId)
  }

  const isSearchMatch = (permission: PermissionData): boolean => {
    if (!permissionSearchKeyword.value) return false
    const keyword = permissionSearchKeyword.value.toLowerCase()
    return permission.name.toLowerCase().includes(keyword) ||
           permission.code.toLowerCase().includes(keyword) ||
           (permission.description && permission.description.toLowerCase().includes(keyword))
  }

  const handleToggleModule = (module: PermissionData, checked: boolean) => {
    const modulePermissions = getModulePermissions(module)
    const moduleIds = modulePermissions.map(p => p.id)
    
    if (checked) {
      selectedPermissionIds.value = [...new Set([...selectedPermissionIds.value, ...moduleIds])]
    } else {
      selectedPermissionIds.value = selectedPermissionIds.value.filter(id => !moduleIds.includes(id))
    }
  }

  const handleTogglePermission = (permissionId: string, checked: boolean) => {
    if (checked) {
      if (!selectedPermissionIds.value.includes(permissionId)) {
        selectedPermissionIds.value.push(permissionId)
      }
    } else {
      selectedPermissionIds.value = selectedPermissionIds.value.filter(id => id !== permissionId)
    }
  }

  const getPermissionTypeColor = (type: PermissionType) => {
    const colorMap = {
      menu: 'info',
      button: 'success', 
      api: 'warning'
    }
    return colorMap[type] || 'default'
  }

  const getPermissionTypeName = (type: PermissionType) => {
    const nameMap = {
      menu: '菜单',
      button: '按钮',
      api: '接口'
    }
    return nameMap[type] || type
  }

  const handleSelectAllPermissions = () => {
    const allIds = getAllPermissionIds(permissionList)
    selectedPermissionIds.value = [...allIds]
  }

  const handleClearAllPermissions = () => {
    selectedPermissionIds.value = []
  }

  const handlePermissionTypeFilter = () => {
    // 权限类型过滤会通过计算属性自动触发
  }

  const handleSavePermissions = async () => {
    if (!permissionRole.value) return

    const permissionNames = selectedPermissionIds.value
      .map(id => getPermissionNameById(id))
      .filter(Boolean)

    updateRoleInList(permissionRole.value.id, {
      permissionIds: [...selectedPermissionIds.value],
      permissionNames,
      updateTime: new Date().toLocaleString(),
    })

    message.success('权限分配成功')
    showPermissionDrawer.value = false
    await loadRoles()
  }

  const handleApplyPermissionTemplate = () => {
    const template = permissionTemplates.find(t => t.id === selectedTemplate.value)
    if (template) {
      selectedPermissionIds.value = [...template.permissions]
      showPermissionTemplate.value = false
      message.success(`已应用 ${template.name}`)
    }
  }

  // ==================== 辅助函数 ====================
  const getPermissionNameById = (permissionId: string): string =>
    findPermissionById(MOCK_PERMISSION_DATA, permissionId)?.name || ''

  const findPermissionById = (permissions: PermissionData[], id: string): PermissionData | null => {
    for (const permission of permissions) {
      if (permission.id === id) return permission
      if (permission.children) {
        const found = findPermissionById(permission.children, id)
        if (found) return found
      }
    }
    return null
  }

  const findTopLevelPermission = (permissions: PermissionData[], targetId: string): PermissionData | null => {
    for (const perm of permissions) {
      if (perm.id === targetId) return perm
      if (perm.children) {
        const found = findPermissionById(perm.children, targetId)
        if (found) return perm
      }
    }
    return null
  }

  const updateRoleInList = (roleId: string, updates: Partial<RoleData>) => {
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

    if (currentRole.value?.id === roleId) {
      currentRole.value = { ...currentRole.value, ...updates }
    }
  }

  const getRoleStatusConfig = (status: number) =>
    COMPONENT_CONFIG.statusConfig[status as keyof typeof COMPONENT_CONFIG.statusConfig] ||
    COMPONENT_CONFIG.statusConfig[1]

  const getRoleTypeConfig = (type: RoleType) =>
    COMPONENT_CONFIG.roleTypeConfig[type] || COMPONENT_CONFIG.roleTypeConfig.custom

  const getRowClassName = (row: RoleData) => (row.status === 0 ? 'disabled-row' : '')

  const getAllPermissionIds = (permissions: PermissionData[]): string[] => {
    const ids: string[] = []
    const collect = (perms: PermissionData[]) => {
      perms.forEach(perm => {
        ids.push(perm.id)
        if (perm.children) {
          collect(perm.children)
        }
      })
    }
    collect(permissions)
    return ids
  }

  const getPermissionCount = (role: RoleData): number => {
    return role.permissionNames?.length || 0
  }

  // ==================== 渲染函数 ====================
  const createTagRenderer = (getConfig: (value: any) => any, valueKey: string) => (row: RoleData) =>
    h(
      NTag,
      {
        type: getConfig(row[valueKey as keyof RoleData]).type,
        size: 'small',
        class: { 'disabled-tag': row.status === 0 },
      },
      {
        icon: () => h(C_Icon, { name: getConfig(row[valueKey as keyof RoleData]).icon, size: 10 }),
        default: () => getConfig(row[valueKey as keyof RoleData]).text,
      }
    )

  const createTextRenderer = (key: keyof RoleData, fallback = '-') => (row: RoleData) =>
    h('div', { class: { 'disabled-text': row.status === 0 } }, row[key] || fallback)

  const createPermissionsRenderer = (row: RoleData) => {
    if (!row.permissionNames || row.permissionNames.length === 0) {
      return h('div', { class: { 'disabled-text': row.status === 0 } }, '-')
    }

    return h(
      NTooltip,
      { trigger: 'hover', placement: 'top', style: { maxWidth: '300px' } },
      {
        trigger: () =>
          h(NSpace, { size: 4 }, {
            default: () => [
              h(NTag, { size: 'small', type: 'primary', class: { 'disabled-tag': row.status === 0 } }, 
                { default: () => row.permissionNames![0] }),
              ...(row.permissionNames!.length > 1 ? [
                h(NTag, { size: 'small', type: 'default', class: { 'disabled-tag': row.status === 0 } },
                  { default: () => `+${row.permissionNames!.length - 1}` })
              ] : []),
            ],
          }),
        default: () => h('div', { style: { padding: '8px' } }, [
          h('div', { style: { fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #f0f0f0', paddingBottom: '4px' } },
            `权限列表 (${row.permissionNames!.length})`),
          h('div', { style: { maxHeight: '200px', overflowY: 'auto' } },
            row.permissionNames!.map(name => h('div', { style: { padding: '2px 0', display: 'flex', alignItems: 'center' } }, [
              h(C_Icon, { name: 'mdi:shield-check', size: 12, style: { marginRight: '6px', color: '#18a058' } }),
              h('span', name),
            ]))
          ),
        ]),
      }
    )
  }

  const createUserCountRenderer = (row: RoleData) => {
    if (!row.userCount || row.userCount === 0) {
      return h('div', { class: { 'disabled-text': row.status === 0 } }, [
        h(C_Icon, { name: 'mdi:account-group', size: 14, style: { marginRight: '4px' } }),
        h('span', '0'),
      ])
    }

    return h(
      NButton,
      {
        text: true,
        type: 'primary',
        size: 'small',
        class: { 'disabled-text': row.status === 0 },
        onClick: () => handleViewRoleUsers(row),
      },
      {
        icon: () => h(C_Icon, { name: 'mdi:account-group', size: 14 }),
        default: () => `${row.userCount} 人`,
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
        icon: COMPONENT_CONFIG.icons.permission,
        text: '权限',
        type: 'primary' as const,
        onClick: () => handlePermissionAssignment(row),
      },
      {
        icon: COMPONENT_CONFIG.icons.edit,
        text: '编辑',
        onClick: () => handleEditRole(row),
      },
      {
        icon: row.status === 1 ? COMPONENT_CONFIG.icons.pause : COMPONENT_CONFIG.icons.play,
        text: row.status === 1 ? '禁用' : '启用',
        type: row.status === 1 ? ('warning' as const) : ('success' as const),
        onClick: () => handleToggleRoleStatus(row),
        disabled: row.type === 'system' && row.code === 'super_admin',
      },
    ]

    return h('div', { style: { display: 'flex', gap: '4px', flexWrap: 'nowrap' } }, [
      ...buttons.map(btn =>
        h(NButton, { size: 'tiny', type: btn.type, disabled: btn.disabled, onClick: btn.onClick }, {
          icon: () => h(C_Icon, { name: btn.icon, size: 12 }),
          default: () => btn.text,
        })
      ),
      h(NPopconfirm, { onPositiveClick: () => handleDeleteRole(row.id), disabled: row.type === 'system' }, {
        trigger: () =>
          h(NButton, { size: 'tiny', type: 'error', disabled: row.type === 'system' }, {
            icon: () => h(C_Icon, { name: COMPONENT_CONFIG.icons.delete, size: 12 }),
            default: () => '删除',
          }),
        default: () => row.type === 'system' ? '系统角色不可删除' : '确认删除该角色吗？',
      }),
    ])
  }

  // ==================== 表格列配置 ====================
  const roleColumns: DataTableColumns<RoleData> = [
    { type: 'selection', disabled: (row: RoleData) => row.type === 'system' },
    { title: '角色类型', key: 'type', width: 100, render: createTagRenderer(getRoleTypeConfig, 'type') },
    { title: '角色名称', key: 'name', width: 120, fixed: 'left', render: createTextRenderer('name') },
    { title: '角色编码', key: 'code', width: 120, render: createTextRenderer('code') },
    { title: '描述', key: 'description', width: 180, render: createTextRenderer('description') },
    { title: '权限', key: 'permissionNames', width: 200, render: (row: RoleData) => createPermissionsRenderer(row) },
    { title: '用户数', key: 'userCount', width: 80, render: createUserCountRenderer },
    { title: '排序', key: 'sort', width: 80, render: createTextRenderer('sort') },
    { title: '状态', key: 'status', width: 80, render: createTagRenderer(getRoleStatusConfig, 'status') },
    { title: '创建时间', key: 'createTime', width: 160, render: createTextRenderer('createTime') },
    { title: '操作', key: 'actions', width: 240, fixed: 'right', render: createActionButtons },
  ]

  const roleUserColumns = [
    { title: '用户名', key: 'username', width: 120 },
    { title: '昵称', key: 'nickname', width: 120 },
    { title: '邮箱', key: 'email', width: 200 },
    { title: '手机号', key: 'phone', width: 120 },
    { title: '部门', key: 'deptName', width: 120 },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (row: RoleUserData) =>
        h(NTag, { type: row.status === 1 ? 'success' : 'error', size: 'small' },
          { default: () => (row.status === 1 ? '正常' : '禁用') }),
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
      key: 'permissionCount',
      label: '权限数量',
      value: `${getPermissionCount(role)} 项`,
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
    ...(role.updateTime ? [{ key: 'updateTime', label: '更新时间', value: role.updateTime }] : []),
  ]

  // ==================== 表单字段配置 ====================
  const getFormFields = () => [
    {
      key: 'name' as keyof RoleFormData,
      label: '角色名称',
      path: 'name',
      component: 'NInput',
      props: { placeholder: '请输入角色名称' },
      condition: true,
    },
    {
      key: 'code' as keyof RoleFormData,
      label: '角色编码',
      path: 'code',
      component: 'NInput',
      props: {
        placeholder: '请输入角色编码',
        disabled: modalMode.value === 'edit',
      },
      condition: true,
    },
    {
      key: 'type' as keyof RoleFormData,
      label: '角色类型',
      path: 'type',
      component: 'NSelect',
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
      component: 'NInputNumber',
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
      component: 'NInput',
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
      component: 'NSwitch',
      props: {
        checkedValue: 1,
        uncheckedValue: 0,
      },
      condition: true,
    },
  ]

  // ==================== 组合式函数 ====================
  const useBatchOperations = () => {
    const handleBatchOperation = (operation: 'delete' | 'toggle', actionFn: (ids: string[]) => void) => {
      if (selectedRoles.value.length === 0) {
        message.warning('请先选择角色')
        return
      }

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
            message.success(`批量${operation === 'delete' ? '删除' : '操作'}成功`)
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
    const buildRoleData = (roleData: RoleFormData, existingRole?: RoleData): RoleData => {
      const baseData = {
        name: roleData.name,
        code: roleData.code,
        type: roleData.type,
        status: roleData.status,
        description: roleData.description || undefined,
        permissionIds: [],
        permissionNames: [],
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

    const validateRoleData = (roleData: RoleFormData, mode: 'add' | 'edit'): { valid: boolean; error?: string } => {
      if (mode === 'edit' && !roleData.id) {
        return { valid: false, error: '角色ID不存在' }
      }

      if (mode === 'add') {
        const existingRole = MOCK_ROLE_DATA.find(role => role.code === roleData.code)
        if (existingRole) {
          return { valid: false, error: '角色编码已存在' }
        }
      }

      return { valid: true }
    }

    const handleAddRoleData = async (roleData: RoleFormData): Promise<boolean> => {
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

    const handleUpdateRoleData = async (roleData: RoleFormData): Promise<boolean> => {
      const validation = validateRoleData(roleData, 'edit')
      if (!validation.valid) {
        message.error(validation.error!)
        return false
      }

      const roleIndex = MOCK_ROLE_DATA.findIndex(role => role.id === roleData.id)
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
  const { handleBatchOperation, batchDeleteRoles, batchToggleRoles } = useBatchOperations()
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
      permissionIds: [],
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
      const success = modalMode.value === 'add' ? await handleAddRoleData(formData) : await handleUpdateRoleData(formData)

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

  const handleViewRoleUsers = async (role: RoleData) => {
    currentRole.value = role
    try {
      const response = await getRoleUsersApi(role.id)
      roleUserList.splice(0, roleUserList.length, ...response.data)
      showRoleUsers.value = true
    } catch {
      message.error('获取用户列表失败')
    }
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
    
    // 初始化展开状态
    if (permissionList.length > 0) {
      moduleExpandState[permissionList[0].id] = true
    }
  })
</script>

<style lang="scss">
// ==================== 树形权限布局全局样式 ====================
.tree-permission-layout {
  display: flex !important;
  flex-direction: column !important;
  height: calc(100vh - 140px) !important;
  background: var(--n-color-base) !important;
  overflow: hidden !important;

  // ==================== 工具栏样式 ====================
  .permission-toolbar {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 20px 24px !important;
    background: linear-gradient(135deg, var(--n-color-hover) 0%, rgba(24, 160, 88, 0.05) 100%) !important;
    border-bottom: 1px solid var(--n-border-color) !important;
    border-radius: 12px !important;
    margin-bottom: 16px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
    flex-shrink: 0 !important;

    .toolbar-left {
      display: flex !important;
      align-items: center !important;
      gap: 16px !important;
    }
  }

  // ==================== 统计信息栏 ====================
  .permission-stats {
    padding: 16px 24px !important;
    background: var(--n-color-hover) !important;
    border-radius: 8px !important;
    margin-bottom: 20px !important;
    border: 1px solid var(--n-border-color) !important;
    flex-shrink: 0 !important;

    .stat-item {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;

      .stat-label {
        font-size: 14px !important;
        color: var(--n-text-color-disabled) !important;
      }

      .stat-value {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: var(--n-text-color) !important;

        &.highlight {
          color: var(--n-color-primary) !important;
        }
      }
    }
  }

  // ==================== 树形容器 ====================
  .tree-permissions-container {
    flex: 1 !important;
    overflow-y: auto !important;
    padding: 0 4px !important;
    min-height: 0 !important;

    .permission-module-tree {
      margin-bottom: 24px !important;
      background: var(--n-color-base) !important;
      border: 1px solid var(--n-border-color) !important;
      border-radius: 16px !important;
      overflow: hidden !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
      }

      // 模块头部
      .module-header-tree {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 20px 24px !important;
        background: linear-gradient(135deg, var(--n-color-hover) 0%, rgba(24, 160, 88, 0.03) 100%) !important;
        border-bottom: 1px solid var(--n-border-color) !important;

        .module-info {
          flex: 1 !important;

          .module-title-section {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            margin-bottom: 8px !important;

            .expand-button {
              padding: 4px !important;
              margin-right: 4px !important;
            }

            h4 {
              margin: 0 !important;
              font-size: 18px !important;
              font-weight: 600 !important;
              color: var(--n-text-color) !important;
            }
          }

          .module-description {
            margin: 0 0 0 42px !important;
            font-size: 14px !important;
            color: var(--n-text-color-disabled) !important;
          }
        }

        .module-controls {
          display: flex !important;
          align-items: center !important;
          gap: 24px !important;

          .module-progress {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 8px !important;
            min-width: 120px !important;

            .progress-text {
              font-size: 12px !important;
              color: var(--n-text-color-disabled) !important;
              font-weight: 500 !important;
            }
          }
        }
      }

      .child-permissions-collapse {
        margin-left: 60px !important;
        margin-right: 20px !important;
        padding: 12px 0 !important;
      }
    }
  }

  // ==================== 权限卡片树形样式 ====================
  .permission-tree-content {
    padding: 0 !important;
  }

  .permission-tree-node {
    border-bottom: 1px solid var(--n-border-color) !important;

    &:last-child {
      border-bottom: none !important;
    }
  }

  // 菜单权限卡片
  .permission-card-tree.menu-permission {
    padding: 20px 24px !important;
    background: var(--n-color-base) !important;
    border: none !important;
    border-left: 4px solid transparent !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    position: relative !important;

    &:hover {
      background: var(--n-color-hover) !important;
      border-left-color: var(--n-color-primary) !important;
    }

    &.selected {
      background: linear-gradient(135deg, rgba(24, 160, 88, 0.05) 0%, rgba(24, 160, 88, 0.02) 100%) !important;
      border-left-color: var(--n-color-success) !important;

      .permission-name {
        color: var(--n-color-success) !important;
        font-weight: 600 !important;
      }
    }

    &.has-children {
      border-left-color: var(--n-color-info) !important;
    }

    .permission-card-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;

      .permission-main-section {
        display: flex !important;
        align-items: center !important;
        flex: 1 !important;
        gap: 16px !important;
      }

      .permission-info-section {
        flex: 1 !important;

        .permission-title {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin-bottom: 8px !important;

          .permission-name {
            font-size: 16px !important;
            font-weight: 500 !important;
            color: var(--n-text-color) !important;
          }

          .children-count-tag {
            margin-left: auto !important;
          }
        }

        .permission-details {
          .permission-code {
            display: inline-block !important;
            font-size: 11px !important;
            color: var(--n-text-color-disabled) !important;
            font-family: 'Monaco', 'Consolas', 'SF Mono', monospace !important;
            background: var(--n-color-hover) !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
            margin-right: 8px !important;
          }

          .permission-description {
            font-size: 13px !important;
            color: var(--n-text-color-disabled) !important;
          }
        }
      }

      .expand-child-button {
        padding: 8px !important;
        opacity: 0.7 !important;
        transition: opacity 0.2s ease !important;

        &:hover {
          opacity: 1 !important;
        }
      }
    }

    .selection-indicator {
      position: absolute !important;
      top: 16px !important;
      right: 16px !important;
      color: var(--n-color-success) !important;
      z-index: 2 !important;
    }
  }

  // 子权限网格
  .child-permissions-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
    gap: 12px !important;
    padding: 12px 0 !important;
  }

  // 子权限卡片
  .permission-card-tree.child-permission {
    padding: 12px 16px !important;
    background: var(--n-color-base) !important;
    border: 1px solid var(--n-border-color) !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    position: relative !important;

    &:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
      border-color: var(--n-color-primary) !important;
    }

    &.selected {
      background: linear-gradient(135deg, rgba(24, 160, 88, 0.05) 0%, rgba(24, 160, 88, 0.02) 100%) !important;
      border-color: var(--n-color-success) !important;
      box-shadow: 0 2px 8px rgba(24, 160, 88, 0.1) !important;

      .child-permission-name {
        color: var(--n-color-success) !important;
        font-weight: 500 !important;
      }
    }

    &.button-type {
      border-left: 3px solid var(--n-color-success) !important;
    }

    &.api-type {
      border-left: 3px solid var(--n-color-warning) !important;
    }

    .child-permission-content {
      .child-permission-header {
        display: flex !important;
        align-items: flex-start !important;
        gap: 12px !important;

        .child-permission-info {
          flex: 1 !important;

          .child-permission-title {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            margin-bottom: 6px !important;

            .child-permission-name {
              font-size: 14px !important;
              font-weight: 400 !important;
              color: var(--n-text-color) !important;
            }
          }

          .child-permission-details {
            .child-permission-code {
              display: inline-block !important;
              font-size: 10px !important;
              color: var(--n-text-color-disabled) !important;
              font-family: 'Monaco', 'Consolas', 'SF Mono', monospace !important;
              background: var(--n-color-hover) !important;
              padding: 1px 4px !important;
              border-radius: 3px !important;
              margin-right: 6px !important;
            }

            .child-permission-description {
              font-size: 11px !important;
              color: var(--n-text-color-disabled) !important;
              line-height: 1.3 !important;
            }
          }
        }
      }
    }

    .child-selection-indicator {
      position: absolute !important;
      top: 8px !important;
      right: 8px !important;
      color: var(--n-color-success) !important;
      background: var(--n-color-base) !important;
      border-radius: 50% !important;
      padding: 2px !important;
    }
  }

  // ==================== 预览区域 ====================
  .selected-preview-tree {
    background: var(--n-color-hover) !important;
    border-top: 1px solid var(--n-border-color) !important;
    border-radius: 0 0 12px 12px !important;
    margin-top: auto !important;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04) !important;
    flex-shrink: 0 !important;

    .preview-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 16px 24px !important;
      border-bottom: 1px solid var(--n-border-color) !important;

      h5 {
        margin: 0 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: var(--n-text-color) !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;

        &::before {
          content: '' !important;
          width: 4px !important;
          height: 16px !important;
          background: var(--n-color-primary) !important;
          border-radius: 2px !important;
        }
      }
    }

    .preview-content {
      padding: 20px 24px !important;
      max-height: 300px !important;
      overflow-y: auto !important;

      .preview-tree-structure {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)) !important;
        gap: 16px !important;

        .preview-module-tree {
          background: var(--n-color-base) !important;
          padding: 16px !important;
          border-radius: 8px !important;
          border: 1px solid var(--n-border-color) !important;

          .preview-group-header {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            margin-bottom: 12px !important;
            padding-bottom: 8px !important;
            border-bottom: 1px solid var(--n-border-color) !important;

            .group-name {
              font-weight: 500 !important;
              color: var(--n-text-color) !important;
              flex: 1 !important;
            }
          }

          .preview-permissions-tree {
            .preview-menu-item {
              margin-bottom: 12px !important;

              .preview-menu-header {
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                margin-bottom: 6px !important;
                padding: 4px 8px !important;
                background: rgba(24, 160, 88, 0.05) !important;
                border-radius: 4px !important;

                .menu-name {
                  flex: 1 !important;
                  font-size: 13px !important;
                  font-weight: 500 !important;
                  color: var(--n-color-success) !important;
                }
              }

              .preview-child-permissions {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 4px !important;
                padding-left: 18px !important;

                .child-preview-tag {
                  font-size: 11px !important;
                }
              }
            }
          }
        }
      }
    }

    .preview-summary {
      padding: 16px 24px !important;
    }
  }

  // ==================== 响应式设计 ====================
  @media (max-width: 1400px) {
    .child-permissions-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
    }

    .preview-tree-structure {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
    }
  }

  @media (max-width: 1200px) {
    .permission-toolbar {
      flex-direction: column !important;
      gap: 16px !important;
      align-items: stretch !important;

      .toolbar-left,
      .toolbar-right {
        justify-content: center !important;
      }
    }

    .module-header-tree {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 16px !important;

      .module-controls {
        justify-content: space-between !important;
      }
    }
  }

  @media (max-width: 768px) {
    .child-permissions-grid {
      grid-template-columns: 1fr !important;
    }

    .child-permissions-collapse {
      margin-left: 20px !important;
      margin-right: 10px !important;
    }

    .preview-tree-structure {
      grid-template-columns: 1fr !important;
    }
  }
}

// ==================== 权限头部样式 ====================
.permission-header-new {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 !important;

  .header-info {
    display: flex !important;
    align-items: center !important;
    gap: 16px !important;

    h3 {
      margin: 0 !important;
      font-size: 20px !important;
      font-weight: 600 !important;
      color: var(--n-text-color) !important;
    }

    p {
      margin: 4px 0 0 0 !important;
      font-size: 14px !important;
      color: var(--n-text-color-disabled) !important;
    }
  }

  .header-actions {
    display: flex !important;
    align-items: center !important;
  }
}
</style>

<style lang="scss" scoped>
// ==================== 主容器样式 ====================
.role-management {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: calc(100vh - 120px);
  gap: 16px;

  .main-content {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .content-card {
    display: flex;
    flex-direction: column;
    height: 100%;

    :deep(.n-card__content) {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
  }

  // ==================== 角色表格样式 ====================
  :deep(.n-data-table) {
    .n-data-table-td {
      padding: 12px 8px;
    }

    .n-data-table-th {
      background-color: var(--n-color-hover);
    }

    .disabled-row {
      background-color: #fafafa !important;
      opacity: 0.7;

      &:hover {
        background-color: #f0f0f0 !important;
      }

      td {
        background-color: transparent !important;
      }
    }

    .n-data-table-td:last-child {
      .n-space {
        flex-wrap: nowrap !important;
      }
    }
  }

  // ==================== 禁用状态通用样式 ====================
  .disabled-text {
    opacity: 0.6;
    color: #999 !important;
    text-decoration: line-through;
  }

  .disabled-tag {
    opacity: 0.6;
    color: #999 !important;
    filter: grayscale(50%);
    
    :deep(.n-tag__content) {
      text-decoration: line-through;
    }
  }

  // ==================== 角色详情样式 ====================
  .role-detail {
    padding: 16px;
    position: relative;

    .disabled-card {
      opacity: 0.7;
      background-color: #fafafa;
      
      :deep(.n-card__header) {
        background-color: #f0f0f0;
      }
    }

    .disabled-text {
      opacity: 0.6;
      color: #999 !important;
      text-decoration: line-through;
    }

    .disabled-tag {
      opacity: 0.6;
      color: #999 !important;
      filter: grayscale(50%);
      
      :deep(.n-tag__content) {
        text-decoration: line-through;
      }
    }
  }

  // ==================== 权限模板样式 ====================
  .permission-templates {
    .template-selected {
      border-color: var(--n-color-primary) !important;
      background-color: var(--n-color-primary-suppl) !important;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15) !important;
    }

    :deep(.n-card) {
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }
  }
}
</style>