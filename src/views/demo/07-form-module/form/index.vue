<template>
  <div class="demo-page">
    <div class="page-header">
      <h1>表单布局演示</h1>
      <p>基于优化验证规则的组件化布局系统</p>
    </div>

    <!-- 布局控制 -->
    <NCard
      title="布局控制"
      class="mb-4"
    >
      <NSpace>
        <span>布局类型:</span>
        <NSelect
          v-model:value="currentLayout"
          :options="layoutOptions"
          style="width: 150px"
        />
        <span>标签位置:</span>
        <NSelect
          v-model:value="labelPlacement"
          :options="labelPlacementOptions"
          style="width: 120px"
        />
        <span>实时验证:</span>
        <NSwitch v-model:value="validateOnChange" />
        <NButton
          type="primary"
          size="small"
          @click="fillTestData"
        >
          填充测试数据
        </NButton>
        <NButton
          type="info"
          size="small"
          @click="previewData"
        >
          预览数据
        </NButton>
      </NSpace>
    </NCard>

    <!-- 表单展示 -->
    <NCard :title="`${getCurrentLayoutName()} 布局示例`">
      <C_Form
        ref="formRef"
        :options="formOptions"
        :layout-type="currentLayout"
        :layout-config="currentLayoutConfig"
        :validate-on-value-change="validateOnChange"
        :label-placement="labelPlacement"
        v-model="formData"
        @submit="handleSubmit"
        @validate-success="handleValidateSuccess"
        @validate-error="handleValidateError"
      >
        <template #action="{ validate, reset, clearValidation }">
          <NSpace>
            <NButton
              type="primary"
              @click="submitForm(validate as () => Promise<void>)"
              :loading="loading"
            >
              提交表单
            </NButton>
            <NButton @click="resetForm(reset as () => void)">重置</NButton>
            <NButton
              type="info"
              @click="validateSingleField"
            >
              验证用户名
            </NButton>
            <NButton
              type="warning"
              @click="(clearValidation as () => void)()"
            >
              清除验证
            </NButton>
          </NSpace>
        </template>
      </C_Form>
    </NCard>

    <!-- 数据预览弹窗 -->
    <NModal
      v-model:show="showPreview"
      preset="card"
      title="表单数据"
      size="large"
    >
      <NCode
        :code="JSON.stringify(formData, null, 2)"
        language="json"
      />
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import { PRESET_RULES, RULE_COMBOS, customRule } from '@/utils/v_verify'

  const message = useMessage()

  // 响应式数据 - 明确类型定义
  const formRef = ref()
  const loading = ref(false)
  const showPreview = ref(false)
  const currentLayout = ref<'default' | 'inline' | 'grid' | 'card'>('default')
  const validateOnChange = ref(false)
  const labelPlacement = ref<'left' | 'top'>('left')
  const formData = ref<Record<string, any>>({})

  // 布局配置 - 明确类型定义
  const layoutOptions: Array<{
    label: string
    value: 'default' | 'inline' | 'grid' | 'card'
  }> = [
    { label: '默认布局', value: 'default' },
    { label: '内联布局', value: 'inline' },
    { label: '网格布局', value: 'grid' },
    { label: '卡片布局', value: 'card' },
  ]

  // 标签位置配置 - 明确类型定义
  const labelPlacementOptions: Array<{ label: string; value: 'left' | 'top' }> =
    [
      { label: '左侧', value: 'left' },
      { label: '顶部', value: 'top' },
    ]

  const currentLayoutConfig = computed(() => {
    switch (currentLayout.value) {
      case 'inline':
        return {
          inline: { gap: 16, align: 'center' as const },
        }
      case 'grid':
        return {
          grid: { cols: 24, gutter: 16 },
        }
      case 'card':
        return {
          card: {
            groups: [
              { key: 'basic', title: '基础信息', description: '用户基本信息' },
              { key: 'profile', title: '个人档案', description: '详细资料' },
              { key: 'settings', title: '系统设置', description: '配置选项' },
            ],
          },
        }
      default:
        return {}
    }
  })

  // 表单配置
  const formOptions = [
    {
      type: 'input',
      prop: 'username',
      label: '用户名',
      placeholder: '请输入用户名',
      rules: RULE_COMBOS.username('用户名'),
      layout: { span: 12, width: '200px', group: 'basic' },
    },
    {
      type: 'input',
      prop: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱',
      rules: RULE_COMBOS.email('邮箱'),
      layout: { span: 12, width: '200px', group: 'basic' },
    },
    {
      type: 'input',
      prop: 'phone',
      label: '手机号',
      placeholder: '请输入手机号',
      rules: RULE_COMBOS.mobile('手机号'),
      layout: { span: 12, width: '200px', group: 'basic' },
    },
    {
      type: 'inputNumber',
      prop: 'age',
      label: '年龄',
      placeholder: '请输入年龄',
      rules: [
        PRESET_RULES.required('年龄'),
        PRESET_RULES.range('年龄', 18, 65),
      ],
      attrs: { min: 1, max: 120 },
      layout: { span: 12, width: '150px', group: 'basic' },
    },
    {
      type: 'select',
      prop: 'gender',
      label: '性别',
      placeholder: '请选择性别',
      rules: [PRESET_RULES.required('性别')],
      children: [
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
        { value: 'other', label: '其他' },
      ],
      layout: { span: 12, group: 'profile' },
    },
    {
      type: 'checkbox',
      prop: 'hobbies',
      label: '爱好',
      rules: [
        customRule(
          (value: any[]) => value && value.length > 0,
          '请至少选择一个爱好'
        ),
      ],
      children: [
        { value: 'reading', label: '阅读' },
        { value: 'music', label: '音乐' },
        { value: 'sports', label: '运动' },
        { value: 'travel', label: '旅行' },
      ],
      layout: { span: 24, group: 'profile' },
    },
    {
      type: 'datePicker',
      prop: 'birthday',
      label: '生日',
      placeholder: '请选择生日',
      rules: [
        PRESET_RULES.required('生日'),
        customRule((value: any) => {
          if (!value) return true
          const birthYear = new Date(value).getFullYear()
          const currentYear = new Date().getFullYear()
          return currentYear - birthYear >= 18
        }, '必须年满18岁'),
      ],
      attrs: { type: 'date' },
      layout: { span: 12, group: 'profile' },
    },
    {
      type: 'textarea',
      prop: 'bio',
      label: '个人简介',
      placeholder: '介绍一下自己...',
      rules: [PRESET_RULES.length('个人简介', 10, 200)],
      attrs: { rows: 3, maxlength: 200, showCount: true },
      layout: { span: 24, group: 'profile' },
    },
    {
      type: 'input',
      prop: 'password',
      label: '密码',
      placeholder: '请输入密码',
      rules: RULE_COMBOS.password('密码'),
      attrs: { type: 'password', showPasswordOn: 'mousedown' },
      layout: { span: 12, group: 'settings' },
    },
    {
      type: 'input',
      prop: 'confirmPassword',
      label: '确认密码',
      placeholder: '请再次输入密码',
      rules: RULE_COMBOS.confirmPassword(
        '确认密码',
        () => formData.value.password
      ),
      attrs: { type: 'password', showPasswordOn: 'mousedown' },
      layout: { span: 12, group: 'settings' },
    },
    {
      type: 'switch',
      prop: 'notifications',
      label: '接收通知',
      value: true,
      layout: { span: 12, group: 'settings' },
    },
    {
      type: 'rate',
      prop: 'satisfaction',
      label: '满意度',
      value: 0,
      rules: [customRule((value: number) => value > 0, '请给出满意度评分')],
      attrs: { allowHalf: true },
      layout: { span: 12, group: 'settings' },
    },
  ]

  // 方法
  const getCurrentLayoutName = (): string => {
    return (
      layoutOptions.find(opt => opt.value === currentLayout.value)?.label ||
      '未知'
    )
  }

  const fillTestData = (): void => {
    const testData = {
      username: 'testuser123',
      email: 'test@example.com',
      phone: '13800138000',
      age: 25,
      gender: 'male',
      hobbies: ['reading', 'music'],
      birthday: new Date('1998-01-01').getTime(),
      bio: '这是一段测试的个人简介，用于演示表单验证功能。',
      password: 'Test123456',
      confirmPassword: 'Test123456',
      notifications: true,
      satisfaction: 4,
    }
    formRef.value?.setFieldsValue(testData)
    message.success('已填充测试数据')
  }

  const previewData = (): void => {
    showPreview.value = true
  }

  const submitForm = async (validate: () => Promise<void>): Promise<void> => {
    try {
      loading.value = true
      await validate()
      message.success('表单验证通过，提交成功！')
      if (import.meta.env.DEV) {
        console.log('表单数据:', formData.value)
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('验证失败:', error)
      }
      message.error('表单验证失败，请检查输入')
    } finally {
      loading.value = false
    }
  }

  const resetForm = (reset: () => void): void => {
    reset()
    message.info('表单已重置')
  }

  const validateSingleField = async (): Promise<void> => {
    try {
      if (!formRef.value) {
        message.error('表单组件未就绪')
        return
      }

      // 类型安全的组件方法调用
      const formInstance = formRef.value as {
        validate?: (fields?: string[]) => Promise<void>
        validateField?: (field: string) => Promise<void>
        validateFields?: (fields: string[]) => Promise<void>
      }

      // 方式1: 尝试使用组件的 validate 方法验证特定字段
      if (typeof formInstance.validate === 'function') {
        await formInstance.validate(['username'])
        message.success('用户名验证通过')
        return
      }

      // 方式2: 尝试使用组件的 validateField 方法
      if (typeof formInstance.validateField === 'function') {
        await formInstance.validateField('username')
        message.success('用户名验证通过')
        return
      }

      // 方式3: 如果组件有 validateFields 方法
      if (typeof formInstance.validateFields === 'function') {
        await formInstance.validateFields(['username'])
        message.success('用户名验证通过')
        return
      }

      // 如果以上方法都不可用，提示用户
      message.warning('当前组件不支持单字段验证，请使用整表验证')
    } catch (error: any) {
      message.error('用户名验证失败')
      if (import.meta.env.DEV) {
        console.error('验证错误:', error)
      }
    }
  }

  const handleSubmit = (payload: {
    model: Record<string, any>
    form: any
  }): void => {
    if (import.meta.env.DEV) {
      console.log('表单提交事件:', payload)
    }
    message.success('表单提交成功（事件回调）')
  }

  const handleValidateSuccess = (model: Record<string, any>): void => {
    if (import.meta.env.DEV) {
      console.log('验证成功:', model)
    }
  }

  const handleValidateError = (errors: any): void => {
    if (import.meta.env.DEV) {
      console.error('验证失败:', errors)
    }
  }
</script>

<style scoped>
  .demo-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }

  .page-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .page-header h1 {
    margin: 0 0 8px 0;
    color: var(--text-color-1);
  }

  .page-header p {
    margin: 0;
    color: var(--text-color-2);
    font-size: 14px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }
</style>
