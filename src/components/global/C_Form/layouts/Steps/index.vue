<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 21:25:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-01 16:32:01
 * @FilePath: \Robot_Admin\src\components\global\C_Form\layouts\Steps\index.vue
 * @Description: 表单组件  - 步骤布局组件 - 支持分步骤表单的布局
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎. 
-->

<template>
  <div class="c-form-steps">
    <!-- 无步骤配置时的单一面板模式 -->
    <div
      v-if="!hasSteps"
      class="single-panel"
    >
      <component
        v-for="(item, index) in formItems"
        :key="getItemKey(item, index)"
        :is="item"
      />
    </div>

    <!-- 有步骤配置时的分步骤模式 -->
    <div
      v-else
      class="steps-container"
    >
      <!-- 步骤指示器 -->
      <div class="steps-header">
        <NSteps
          :current="currentStep"
          :status="stepStatus"
          :size="stepsConfig.size"
          :vertical="stepsConfig.vertical"
          class="form-steps"
        >
          <NStep
            v-for="step in stepsWithItems"
            :key="step.config.key"
            :title="step.config.title"
            :description="step.config.description"
            :disabled="step.config.disabled"
          />
        </NSteps>
      </div>

      <!-- 步骤内容区域 -->
      <div class="steps-content">
        <div
          v-for="(step, index) in stepsWithItems"
          v-show="currentStep === index"
          :key="step.config.key"
          class="step-panel"
        >
          <!-- 步骤标题和描述 -->
          <div
            v-if="stepsConfig.showStepHeader"
            class="step-header"
          >
            <h3 class="step-title">{{ step.config.title }}</h3>
            <p
              v-if="step.config.description"
              class="step-description"
            >
              {{ step.config.description }}
            </p>
          </div>

          <!-- 步骤内的表单项 -->
          <div class="step-form-items">
            <component
              v-for="(item, itemIndex) in step.items"
              :key="getItemKey(item, itemIndex)"
              :is="item"
            />
          </div>
        </div>
      </div>

      <!-- 步骤操作按钮 -->
      <div class="steps-actions">
        <NSpace>
          <NButton
            v-if="currentStep > 0"
            :disabled="loading"
            @click="handlePreviousStep"
          >
            {{ stepsConfig.prevButtonText }}
          </NButton>

          <NButton
            v-if="currentStep < stepsWithItems.length - 1"
            type="primary"
            :loading="loading"
            @click="handleNextStep"
          >
            {{ stepsConfig.nextButtonText }}
          </NButton>

          <slot
            name="step-actions"
            :current-step="currentStep"
            :total-steps="stepsWithItems.length"
            :is-first-step="isFirstStep"
            :is-last-step="isLastStep"
            :next-step="handleNextStep"
            :previous-step="handlePreviousStep"
            :go-to-step="goToStep"
          />
        </NSpace>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { VNode } from 'vue'
  import type { StepConfig, StepsLayoutConfig } from '@/types/modules/form'

  // ================= 类型定义 =================

  /**
   * * @description 步骤数据接口
   * ! @interface StepWithItems
   */
  interface StepWithItems {
    /** 步骤配置 */
    config: StepConfig
    /** 步骤内的表单项 */
    items: VNode[]
  }

  /**
   * * @description 组件属性接口
   * ! @interface Props
   */
  interface Props {
    /** 表单项VNode数组 */
    formItems: VNode[]
    /** 布局配置 */
    layoutConfig?: {
      steps?: StepsLayoutConfig
    }
    /** 表单选项配置 */
    options?: Array<{
      layout?: {
        step?: string
      }
    }>
  }

  // ================= 组件属性和事件 =================

  const props = withDefaults(defineProps<Props>(), {
    layoutConfig: () => ({}),
    options: () => [],
  })

  const emit = defineEmits<{
    'step-change': [stepIndex: number, stepKey: string]
    'step-before-change': [currentStep: number, targetStep: number]
    'step-validate': [stepIndex: number]
  }>()

  // ================= 响应式状态 =================

  const currentStep = ref<number>(0)
  const loading = ref<boolean>(false)
  const stepValidationStatus = reactive<Record<number, boolean>>({})

  // ================= 计算属性 =================

  /**
   * * @description 获取步骤配置
   * ! @return 步骤相关的所有配置
   */
  const stepsConfig = computed(() => {
    const config = props.layoutConfig?.steps || {}
    return {
      steps: config.steps || [],
      vertical: config.vertical || false,
      size: config.size || 'medium',
      showStepHeader: config.showStepHeader !== false,
      validateBeforeNext: config.validateBeforeNext || false,
      prevButtonText: config.prevButtonText || '上一步',
      nextButtonText: config.nextButtonText || '下一步',
      defaultStep: config.defaultStep || 0,
    }
  })

  /**
   * * @description 是否有步骤配置
   * ! @return 是否配置了步骤
   */
  const hasSteps = computed((): boolean => {
    return stepsConfig.value.steps.length > 0
  })

  /**
   * * @description 包含表单项的步骤数据
   * ! @return 步骤数据数组
   */
  const stepsWithItems = computed((): StepWithItems[] => {
    if (!hasSteps.value) return []

    const stepMap = new Map<string, VNode[]>()

    // 初始化步骤映射
    stepsConfig.value.steps.forEach(step => {
      stepMap.set(step.key, [])
    })

    // 分配表单项到对应步骤
    props.formItems.forEach((item, index) => {
      const option = props.options?.[index]
      const stepKey =
        option?.layout?.step || stepsConfig.value.steps[0]?.key || 'default'

      if (!stepMap.has(stepKey)) {
        stepMap.set(stepKey, [])
      }
      stepMap.get(stepKey)!.push(item)
    })

    // 只返回有表单项的步骤
    return stepsConfig.value.steps
      .map(stepConfig => ({
        config: stepConfig,
        items: stepMap.get(stepConfig.key) || [],
      }))
      .filter(step => step.items.length > 0)
  })

  /**
   * * @description 获取步骤状态
   * ! @return 步骤指示器状态
   */
  const stepStatus = computed(() => {
    // 检查是否有步骤验证失败
    for (let i = 0; i <= currentStep.value; i++) {
      if (stepValidationStatus[i] === false) {
        return 'error'
      }
    }
    return 'process'
  })

  /**
   * * @description 是否为第一步
   * ! @return 布尔值
   */
  const isFirstStep = computed((): boolean => {
    return currentStep.value === 0
  })

  /**
   * * @description 是否为最后一步
   * ! @return 布尔值
   */
  const isLastStep = computed((): boolean => {
    return currentStep.value === stepsWithItems.value.length - 1
  })

  // ================= 工具方法 =================

  /**
   * * @description 获取表单项的唯一key
   * ? @param item VNode实例
   * ? @param index 索引
   * ! @return 唯一标识符
   */
  const getItemKey = (item: VNode, index: number): string => {
    if (item.key != null) {
      return String(item.key)
    }

    const itemProps = item.props as Record<string, any> | null
    if (itemProps?.path) {
      return itemProps.path
    }

    return `step-item-${index}`
  }

  /**
   * * @description 验证当前步骤
   * ! @return 验证结果
   */
  const validateCurrentStep = async (): Promise<boolean> => {
    try {
      // 强制断言返回值类型
      const result = await Promise.resolve(
        emit('step-validate', currentStep.value) as unknown as
          | boolean
          | Promise<boolean>
      )
      const valid = result !== false
      stepValidationStatus[currentStep.value] = valid
      return valid
    } catch (error) {
      console.error('[Steps Layout] 步骤验证失败:', error)
      stepValidationStatus[currentStep.value] = false
      return false
    }
  }

  /**
   * * @description 切换步骤的通用逻辑
   * ? @param targetStep 目标步骤索引
   * ? @param needValidation 是否需要验证
   * ! @return 是否切换成功
   */
  const switchToStep = async (
    targetStep: number,
    needValidation = false
  ): Promise<boolean> => {
    if (targetStep < 0 || targetStep >= stepsWithItems.value.length) {
      return false
    }

    if (targetStep === currentStep.value) {
      return true
    }

    try {
      loading.value = true

      // 验证步骤（如果需要）
      if (needValidation && stepsConfig.value.validateBeforeNext) {
        const isValid = await validateCurrentStep()
        if (!isValid) {
          return false
        }
      }

      // 触发步骤切换前事件
      await emit('step-before-change', currentStep.value, targetStep)

      currentStep.value = targetStep
      emit(
        'step-change',
        currentStep.value,
        stepsWithItems.value[currentStep.value].config.key
      )
      return true
    } catch (error) {
      console.error('[Steps Layout] 步骤切换失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // ================= 事件处理方法 =================

  /**
   * * @description 下一步操作
   */
  const handleNextStep = async (): Promise<void> => {
    await switchToStep(currentStep.value + 1, true)
  }

  /**
   * * @description 上一步操作
   */
  const handlePreviousStep = (): void => {
    switchToStep(currentStep.value - 1)
  }

  /**
   * * @description 跳转到指定步骤
   * ? @param stepIndex 目标步骤索引
   */
  const goToStep = async (stepIndex: number): Promise<void> => {
    if (stepsWithItems.value[stepIndex]?.config.disabled) {
      return
    }

    const needValidation = stepIndex > currentStep.value
    await switchToStep(stepIndex, needValidation)
  }

  /**
   * * @description 初始化默认激活的步骤
   */
  const initializeCurrentStep = (): void => {
    if (!hasSteps.value || stepsWithItems.value.length === 0) {
      return
    }

    const { defaultStep } = stepsConfig.value
    const isValidDefaultStep =
      defaultStep >= 0 &&
      defaultStep < stepsWithItems.value.length &&
      !stepsWithItems.value[defaultStep]?.config.disabled

    currentStep.value = isValidDefaultStep ? defaultStep : 0
  }

  // ================= 生命周期 =================

  onMounted(() => {
    initializeCurrentStep()
  })

  watch(
    () => stepsWithItems.value,
    () => initializeCurrentStep(),
    { immediate: true }
  )

  // ================= 对外暴露 =================

  defineExpose({
    nextStep: handleNextStep,
    previousStep: handlePreviousStep,
    goToStep,
    validateCurrentStep,
    currentStep: readonly(currentStep),
    totalSteps: computed(() => stepsWithItems.value.length),
  })

  // ================= 开发环境验证 =================

  if (import.meta.env.DEV) {
    watchEffect(() => {
      const { options, formItems } = props
      if (options && options.length !== formItems.length) {
        console.warn(
          `[Steps Layout] 配置项数量(${options.length})与表单项数量(${formItems.length})不匹配`
        )
      }

      if (hasSteps.value) {
        const stepKeys = stepsConfig.value.steps.map(step => step.key)
        const uniqueKeys = new Set(stepKeys)
        if (stepKeys.length !== uniqueKeys.size) {
          console.warn('[Steps Layout] 存在重复的步骤key')
        }
      }
    })
  }
</script>

<style scoped>
  .c-form-steps {
    width: 100%;
  }

  .single-panel {
    width: 100%;
  }

  .steps-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .steps-header {
    width: 100%;
  }

  .steps-content {
    flex: 1;
    min-height: 200px;
    position: relative;
  }

  .step-panel {
    width: 100%;
    animation: fadeIn 0.3s ease-in-out;
  }

  .step-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .step-title {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color-1);
  }

  .step-description {
    margin: 0;
    color: var(--text-color-2);
    font-size: 14px;
    line-height: 1.5;
  }

  .step-form-items {
    width: 100%;
  }

  .steps-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ================= 垂直步骤样式 ================= */

  .steps-container:has(.form-steps:deep(.n-steps--vertical)) {
    flex-direction: row;
    align-items: flex-start;
  }

  .steps-container:has(.form-steps:deep(.n-steps--vertical)) .steps-header {
    flex-shrink: 0;
    width: 250px;
    margin-right: 24px;
  }

  .steps-container:has(.form-steps:deep(.n-steps--vertical)) .steps-content {
    flex: 1;
  }

  /* ================= 响应式设计 ================= */

  @media (max-width: 1024px) {
    .steps-container {
      gap: 20px;
    }

    .steps-container:has(.form-steps:deep(.n-steps--vertical)) .steps-header {
      width: 200px;
      margin-right: 20px;
    }
  }

  @media (max-width: 768px) {
    .steps-container {
      gap: 16px;
    }

    .steps-container:has(.form-steps:deep(.n-steps--vertical)) {
      flex-direction: column !important;
    }

    .steps-container:has(.form-steps:deep(.n-steps--vertical)) .steps-header {
      width: 100% !important;
      margin-right: 0 !important;
      margin-bottom: 16px;
    }

    .steps-actions {
      flex-direction: column;
      gap: 12px;
    }

    .steps-actions :deep(.n-space) {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .steps-container {
      gap: 12px;
    }

    .step-title {
      font-size: 16px;
    }

    .step-description {
      font-size: 13px;
    }

    .steps-content {
      min-height: 150px;
    }
  }

  /* ================= 辅助功能 ================= */

  @media (prefers-reduced-motion: reduce) {
    .step-panel {
      animation: none !important;
    }
  }

  @media (prefers-contrast: high) {
    .step-header {
      border-bottom-width: 2px;
    }

    .steps-actions {
      border-top-width: 2px;
    }

    .step-title {
      font-weight: 700;
    }
  }

  @media print {
    .steps-header,
    .steps-actions {
      display: none !important;
    }

    .step-panel {
      display: block !important;
      page-break-inside: avoid;
    }
  }
</style>
