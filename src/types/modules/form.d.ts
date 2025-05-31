/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 11:02:02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-31 11:08:56
 * @FilePath: \Robot_Admin\src\types\modules\form.d.ts
 * @Description: 表单相关类型
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// 文件路径: src/types/form.d.ts 或 src/components/global/C_Form/form.d.ts

import type { VNode, DefineComponent, CSSProperties } from 'vue'
import type { FormInst, FormRules, UploadFileInfo } from 'naive-ui'
import type { FieldRule } from '@/utils/v_verify'

declare global {
  namespace Form {
    // =================== 基础类型定义 ===================

    /**
     * 支持的布局类型
     */
    type LayoutType = 'default' | 'inline' | 'grid' | 'card'

    /**
     * 支持的表单控件类型
     */
    type ComponentType =
      | 'input'
      | 'textarea'
      | 'inputNumber'
      | 'select'
      | 'checkbox'
      | 'radio'
      | 'switch'
      | 'slider'
      | 'rate'
      | 'datePicker'
      | 'daterange'
      | 'timePicker'
      | 'cascader'
      | 'colorPicker'
      | 'upload'
      | 'editor'

    /**
     * 选项项接口（用于 select、checkbox、radio 等）
     */
    interface OptionItem {
      value: string | number | boolean
      label: string
      disabled?: boolean
      [key: string]: any
    }

    // =================== 布局相关类型 ===================

    /**
     * 表单项布局配置
     */
    interface ItemLayoutConfig {
      /** 网格布局：占用列数 */
      span?: number
      /** 网格布局：偏移列数 */
      offset?: number
      /** 内联布局：项目宽度 */
      width?: string | number
      /** 卡片布局：所属分组 */
      group?: string
      /** 自定义CSS类名 */
      class?: string
      /** 自定义内联样式 */
      style?: CSSProperties
      /** 是否隐藏 */
      hidden?: boolean
    }

    /**
     * 网格布局配置
     */
    interface GridLayoutConfig {
      /** 总列数，默认24 */
      cols?: number
      /** 水平间距，默认16 */
      gutter?: number
      /** 垂直间距，默认16 */
      yGutter?: number
    }

    /**
     * 内联布局配置
     */
    interface InlineLayoutConfig {
      /** 项目间距，默认16 */
      gap?: number
      /** 对齐方式，默认center */
      align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
      /** 换行方式 */
      wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
    }

    /**
     * 卡片分组配置
     */
    interface CardGroup {
      /** 分组唯一标识 */
      key: string
      /** 分组标题 */
      title: string
      /** 分组描述 */
      description?: string
      /** 是否可折叠 */
      collapsible?: boolean
      /** 默认是否展开 */
      defaultExpanded?: boolean
    }

    /**
     * 卡片布局配置
     */
    interface CardLayoutConfig {
      /** 分组配置列表 */
      groups?: CardGroup[]
      /** 卡片间距 */
      spacing?: number
      /** 是否显示边框 */
      bordered?: boolean
    }

    /**
     * 完整布局配置
     */
    interface LayoutConfig {
      /** 布局类型 */
      type?: LayoutType
      /** 网格布局配置 */
      grid?: GridLayoutConfig
      /** 内联布局配置 */
      inline?: InlineLayoutConfig
      /** 卡片布局配置 */
      card?: CardLayoutConfig
    }

    // =================== 表单配置类型 ===================

    /**
     * 表单配置项接口
     */
    interface FormOption {
      /** 表单控件类型 */
      type: ComponentType
      /** 字段名（唯一标识） */
      prop: string
      /** 字段标签 */
      label?: string
      /** 默认值 */
      value?: any
      /** 占位符文本 */
      placeholder?: string
      /** 验证规则数组 */
      rules?: FieldRule[]
      /** 组件额外属性 */
      attrs?: Record<string, any>
      /** 子选项（select/checkbox/radio用） */
      children?: OptionItem[]
      /** 是否显示，默认true */
      show?: boolean
      /** 布局相关配置 */
      layout?: ItemLayoutConfig
      /** 字段说明/帮助文本 */
      help?: string
      /** 是否必填（UI显示用） */
      required?: boolean
      /** 字段分组（逻辑分组，不同于布局分组） */
      group?: string
      /** 依赖字段（当指定字段有值时才显示） */
      dependsOn?: string | string[]
      /** 依赖条件函数 */
      showWhen?: (formModel: Record<string, any>) => boolean
    }

    // =================== 组件 Props 类型 ===================

    /**
     * C_Form 组件 Props
     */
    interface FormProps {
      /** 表单配置项数组 */
      options: FormOption[]
      /** 双向绑定的表单数据 */
      modelValue?: Record<string, any>
      /** 布局类型 */
      layoutType?: LayoutType
      /** 布局配置 */
      layoutConfig?: LayoutConfig
      /** 是否在值改变时触发验证 */
      validateOnValueChange?: boolean
      /** 表单标签宽度 */
      labelWidth?: string | number
      /** 表单标签位置 */
      labelPlacement?: 'left' | 'top'
      /** 是否显示必填星号 */
      showRequireMark?: boolean
      /** 表单尺寸 */
      size?: 'small' | 'medium' | 'large'
      /** 是否禁用整个表单 */
      disabled?: boolean
      /** 是否只读模式 */
      readonly?: boolean
    }

    /**
     * 布局组件通用 Props
     */
    interface LayoutProps {
      /** 表单项 VNode 数组 */
      formItems: VNode[]
      /** 布局配置 */
      layoutConfig?: LayoutConfig
      /** 原始表单配置选项 */
      options?: FormOption[]
    }

    // =================== 事件类型定义 ===================

    /**
     * 表单提交事件参数
     */
    interface SubmitEventPayload {
      /** 表单数据模型 */
      model: Record<string, any>
      /** 表单实例 */
      form: FormInst
    }

    /**
     * 文件上传相关事件参数
     */
    interface UploadEventPayload {
      file: UploadFileInfo
      fileList: UploadFileInfo[]
      event?: Event
    }

    /**
     * 编辑器事件参数
     */
    interface EditorEventPayload {
      /** 编辑器实例 */
      editor: any
      /** 字段名 */
      prop: string
      /** HTML 内容 */
      html: string
    }

    // =================== 组件实例类型 ===================

    /**
     * C_Form 组件实例暴露的方法
     */
    interface FormInstance {
      /** 验证整个表单 */
      validate(): Promise<void>
      /** 验证指定字段 */
      validateField(field: string | string[]): Promise<void>
      /** 清除验证状态 */
      clearValidation(field?: string | string[]): void
      /** 获取表单数据副本 */
      getModel(): Record<string, any>
      /** 设置多个字段值 */
      setFields(fields: Record<string, any>): void
      /** 重置表单 */
      resetFields(): void
      /** 设置单个字段值 */
      setFieldValue(
        field: string,
        value: any,
        shouldValidate?: boolean
      ): Promise<void>
      /** 获取指定字段值 */
      getFieldValue(field: string): any
      /** 批量设置字段值 */
      setFieldsValue(
        fields: Record<string, any>,
        shouldValidate?: boolean
      ): Promise<void>
      /** 表单引用 */
      formRef: FormInst | null
      /** 表单数据模型 */
      formModel: Record<string, any>
      /** 初始化表单 */
      initialize(): void
    }

    // =================== 布局组件类型 ===================

    /**
     * 默认布局组件类型
     */
    type DefaultLayoutComponent = DefineComponent<LayoutProps>

    /**
     * 内联布局组件类型
     */
    type InlineLayoutComponent = DefineComponent<LayoutProps>

    /**
     * 网格布局组件类型
     */
    type GridLayoutComponent = DefineComponent<LayoutProps>

    /**
     * 卡片布局组件类型
     */
    type CardLayoutComponent = DefineComponent<LayoutProps>

    // =================== 工具类型 ===================

    /**
     * 表单数据模型类型（泛型）
     */
    type FormModel<T = Record<string, any>> = T

    /**
     * 表单验证规则映射
     */
    type FormRulesMap = Record<string, FieldRule[]>

    /**
     * 字段值变化回调
     */
    type FieldChangeCallback = (
      field: string,
      value: any,
      formModel: Record<string, any>
    ) => void

    /**
     * 表单配置构建器类型
     */
    interface FormConfigBuilder {
      /** 添加输入框 */
      addInput(
        prop: string,
        label: string,
        options?: Partial<FormOption>
      ): FormConfigBuilder
      /** 添加选择器 */
      addSelect(
        prop: string,
        label: string,
        options: OptionItem[],
        config?: Partial<FormOption>
      ): FormConfigBuilder
      /** 添加复选框组 */
      addCheckbox(
        prop: string,
        label: string,
        options: OptionItem[],
        config?: Partial<FormOption>
      ): FormConfigBuilder
      /** 添加单选框组 */
      addRadio(
        prop: string,
        label: string,
        options: OptionItem[],
        config?: Partial<FormOption>
      ): FormConfigBuilder
      /** 添加日期选择器 */
      addDatePicker(
        prop: string,
        label: string,
        options?: Partial<FormOption>
      ): FormConfigBuilder
      /** 添加上传组件 */
      addUpload(
        prop: string,
        label: string,
        options?: Partial<FormOption>
      ): FormConfigBuilder
      /** 设置布局 */
      setLayout(
        layoutType: LayoutType,
        config?: LayoutConfig
      ): FormConfigBuilder
      /** 构建配置 */
      build(): FormOption[]
    }
  }
}

// =================== 模块声明 ===================

/**
 * 布局组件模块声明
 */
declare module './layouts/Default/index.vue' {
  const component: Form.DefaultLayoutComponent
  export default component
}

declare module './layouts/Inline/index.vue' {
  const component: Form.InlineLayoutComponent
  export default component
}

declare module './layouts/Grid/index.vue' {
  const component: Form.GridLayoutComponent
  export default component
}

declare module './layouts/Card/index.vue' {
  const component: Form.CardLayoutComponent
  export default component
}

/**
 * C_Form 主组件声明
 */
declare module '@/components/global/C_Form/index.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Form.FormProps>
  export default component
}

export {}
