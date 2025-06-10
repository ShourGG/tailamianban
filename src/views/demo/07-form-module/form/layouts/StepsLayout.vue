<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-06 16:24:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-08 20:43:18
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\StepsLayout.vue
 * @Description: 表单步骤布局 - 演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->
<template>
  <div class="steps-demo">
    <!-- 配置面板 -->
    <NCard
      title="步骤表单配置"
      size="small"
      class="mb-6"
    >
      <NSpace align="center">
        <NCheckbox v-model:checked="layoutConfig.steps.vertical"
          >垂直布局</NCheckbox
        >
        <NCheckbox v-model:checked="layoutConfig.steps.validateBeforeNext"
          >验证后继续</NCheckbox
        >
        <NCheckbox v-model:checked="layoutConfig.steps.showStepHeader"
          >显示步骤标题</NCheckbox
        >

        <!-- 改为单选按钮组 -->
        <div class="size-selector">
          <span class="size-label">步骤大小：</span>
          <NRadioGroup v-model:value="layoutConfig.steps.size">
            <NRadio value="small">小</NRadio>
            <NRadio value="medium">中</NRadio>
          </NRadioGroup>
        </div>
      </NSpace>
    </NCard>

    <!-- 步骤表单 -->
    <C_Form
      ref="formRef"
      v-model="formData"
      :options="formOptions"
      layout-type="steps"
      :layout-config="layoutConfig"
      @step-change="handleStepChange"
      @step-validate="handleStepValidate"
      @submit="handleSubmit"
      @validate-success="handleValidateSuccess"
      @validate-error="handleValidateError"
    />

    <!-- 表单数据预览 -->
    <NCard
      title="表单数据"
      size="small"
      class="mt-6"
    >
      <NCode
        :code="JSON.stringify(formData, null, 2)"
        language="json"
      />
    </NCard>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <NButton
        type="default"
        @click="handleSaveDraft"
      >
        <template #icon>
          <div class="i-carbon-save" />
        </template>
        保存草稿
      </NButton>

      <NButton
        type="default"
        @click="handleLoadDraft"
      >
        <template #icon>
          <div class="i-carbon-folder-open" />
        </template>
        加载草稿
      </NButton>

      <NButton
        type="default"
        @click="handleReset"
      >
        <template #icon>
          <div class="i-carbon-reset" />
        </template>
        重置表单
      </NButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    FormModel,
    FormOption,
    FormInstance,
  } from '@/types/modules/form'
  import { PRESET_RULES } from '@/utils/v_verify'

  const { required, length, email } = PRESET_RULES

  // ================= 状态管理 =================
  const message = useMessage()
  const formRef = ref<FormInstance>()
  const formData = ref<FormModel>({})

  // ================= 配置数据 =================
  const layoutConfig = reactive({
    steps: {
      steps: [
        {
          key: 'step1',
          title: '基本信息',
          description: '填写个人基本信息',
          required: true,
        },
        {
          key: 'step2',
          title: '联系方式',
          description: '填写联系方式和地址',
          required: true,
        },
        {
          key: 'step3',
          title: '安全设置',
          description: '设置登录密码',
          required: true,
        },
        {
          key: 'step4',
          title: '确认提交',
          description: '确认信息并完成注册',
          required: false,
        },
      ],
      size: 'medium' as 'small' | 'medium',
      vertical: false,
      validateBeforeNext: true,
      showStepHeader: true,
      prevButtonText: '上一步',
      nextButtonText: '下一步',
    },
  })

  // ================= 表单字段配置 =================
  const formOptions = computed(() => {
    const options: FormOption[] = [
      // 第一步：基本信息
      {
        type: 'input',
        prop: 'name',
        label: '姓名',
        placeholder: '请输入姓名',
        layout: { step: 'step1' },
        rules: [required('姓名')],
      },
      {
        type: 'input',
        prop: 'idCard',
        label: '身份证号',
        placeholder: '请输入身份证号',
        layout: { step: 'step1' },
        rules: [required('身份证号')],
      },
      {
        type: 'datePicker',
        prop: 'birthday',
        label: '出生日期',
        layout: { step: 'step1' },
        attrs: { type: 'date' },
      },
      {
        type: 'radio',
        prop: 'gender',
        label: '性别',
        layout: { step: 'step1' },
        children: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
        ],
        rules: [required('性别')],
      },

      // 第二步：联系方式
      {
        type: 'input',
        prop: 'phone',
        label: '手机号码',
        placeholder: '请输入手机号码',
        layout: { step: 'step2' },
        rules: [required('手机号码')],
      },
      {
        type: 'input',
        prop: 'email',
        label: '邮箱地址',
        placeholder: '请输入邮箱地址',
        layout: { step: 'step2' },
        rules: [required('邮箱地址'), email('邮箱地址')],
      },
      {
        type: 'input',
        prop: 'address',
        label: '联系地址',
        placeholder: '请输入详细地址',
        layout: { step: 'step2' },
      },
      {
        type: 'input',
        prop: 'company',
        label: '工作单位',
        placeholder: '请输入工作单位',
        layout: { step: 'step2' },
      },

      // 第三步：安全设置
      {
        type: 'input',
        prop: 'password',
        label: '登录密码',
        placeholder: '请输入密码',
        layout: { step: 'step3' },
        attrs: { type: 'password', showPasswordOn: 'click' },
        rules: [required('密码'), length('密码', 6, 20)],
      },
      {
        type: 'input',
        prop: 'confirmPassword',
        label: '确认密码',
        placeholder: '请再次输入密码',
        layout: { step: 'step3' },
        attrs: { type: 'password', showPasswordOn: 'click' },
        rules: [
          required('确认密码'),
          {
            validator: (_rule: unknown, value: string) => {
              if (value && value !== formData.value.password) {
                return Promise.reject(new Error('两次密码输入不一致'))
              }
              return Promise.resolve()
            },
          },
        ],
      },
      {
        type: 'input',
        prop: 'securityQuestion',
        label: '密保问题',
        placeholder: '请输入密保问题',
        layout: { step: 'step3' },
      },
      {
        type: 'input',
        prop: 'securityAnswer',
        label: '密保答案',
        placeholder: '请输入密保答案',
        layout: { step: 'step3' },
      },

      // 第四步：确认提交
      {
        type: 'checkbox',
        prop: 'agreements',
        label: '同意协议',
        layout: { step: 'step4' },
        children: [
          { label: '我已阅读并同意《用户协议》', value: 'user' },
          { label: '我已阅读并同意《隐私政策》', value: 'privacy' },
        ],
        rules: [required('协议')],
      },
      {
        type: 'switch',
        prop: 'newsletter',
        label: '接收邮件通知',
        layout: { step: 'step4' },
      },
      {
        type: 'textarea',
        prop: 'remarks',
        label: '备注信息',
        placeholder: '请输入备注信息（可选）',
        layout: { step: 'step4' },
        attrs: { rows: 3 },
      },
    ]

    return options
  })

  // ================= 事件处理 =================
  const handleStepChange = (stepIndex: number, stepKey: string) => {
    console.log(`切换到步骤 ${stepIndex + 1}: ${stepKey}`)
  }

  const handleStepValidate = (stepIndex: number): boolean => {
    console.log(`验证步骤 ${stepIndex + 1}`)
    return true
  }

  const handleValidateSuccess = (model: FormModel) => {
    console.log('表单验证成功', model)
  }

  const handleValidateError = (errors: unknown) => {
    console.log('表单验证失败', errors)
  }

  const handleSubmit = (payload: { model: FormModel }) => {
    message.success('表单提交成功！')
    console.log('提交的数据:', payload.model)
  }

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('steps-form-draft', JSON.stringify(formData.value))
      message.success('草稿已保存')
    } catch (error) {
      message.error('草稿保存失败')
      console.error('草稿保存失败:', error)
    }
  }

  const handleLoadDraft = () => {
    try {
      const saved = localStorage.getItem('steps-form-draft')
      if (saved) {
        formData.value = JSON.parse(saved)
        message.success('草稿已加载')
      } else {
        message.warning('没有找到保存的草稿')
      }
    } catch (error) {
      message.error('草稿加载失败')
      console.error('草稿加载失败:', error)
    }
  }

  const handleReset = () => {
    formRef.value?.resetFields()
    formData.value = {}
    message.info('表单已重置')
  }
</script>

<style scoped>
  .steps-demo {
    max-width: 1000px;
    margin: 0 auto;
    padding: 24px;
  }

  .size-selector {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .size-label {
    font-size: 14px;
    color: var(--n-text-color-base);
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--n-border-color);
  }

  /* 响应式 */
  @media (max-width: 768px) {
    .steps-demo {
      padding: 16px;
    }

    .action-buttons {
      flex-direction: column;
      align-items: stretch;
    }

    .action-buttons .n-button {
      justify-content: center;
    }
  }
</style>
