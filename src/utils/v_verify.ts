/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-15 21:01:38
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-30 00:43:04
 * @FilePath: \Robot_Admin\src\utils\v_verify.ts
 * @Description: 表单校验规则
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

export type FieldRule = {
  trigger?: 'blur' | 'input' | 'change'
  validator: (value: any) => Promise<void>
  message?: string
}

// 核心生成器简化版
const createRule = (
  trigger: FieldRule['trigger'] = 'blur',
  validateFn: (v: string) => boolean,
  message: string
): FieldRule => ({
  trigger,
  validator: async v => {
    if (!validateFn(v)) throw new Error(message)
  },
  message,
})

// 预设规则库
export const PRESET_RULES = {
  // 通用必填
  required: (field: string) =>
    createRule('blur', v => !!v?.trim(), `${field}不能为空`),

  // 长度范围
  length: (field: string, min: number, max: number) =>
    createRule(
      'input',
      v => v?.length >= min && v?.length <= max,
      `${field}长度需在${min}-${max}位之间`
    ),

  // 预置特殊规则
  mobile: createRule(
    'blur',
    v => /^(?:(?:\+|00)86)?1[3-9]\d{9}$/.test(v),
    '手机号格式错误'
  ),

  idCard: createRule(
    'blur',
    v => /^\d{15}$|^\d{18}$|^\d{17}[\dXx]$/.test(v),
    '身份证号格式错误'
  ),
}

// 自定义规则构造器
export const customRule = (
  validateFn: (v: string) => boolean,
  message: string,
  trigger: FieldRule['trigger'] = 'blur'
) => createRule(trigger, validateFn, message)

//TAG:  使用示例可以参考 @/views/login/data.ts 文件中的使用示例
