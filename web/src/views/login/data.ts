/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 23:35:57
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-21 15:35:40
 * @FilePath: \Robot_Admin\src\views\login\data.ts
 * @Description: 登录页表单数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { PRESET_RULES, type FieldRule } from '@/utils/v_verify'

const { required, length } = PRESET_RULES

// 新增类型定义
type FormField = {
  type: 'input' | 'select' | 'daterange'
  prop: 'username' | 'password'
  value: string
  placeholder: string
  rules: FieldRule[]
  attrs: {
    clearable?: boolean
    showPassword?: boolean
    prefixIcon?: string
    type?: 'text' | 'password'
    showPasswordOn?: 'mousedown' | 'click'
  }
}

export const OPTIONS: FormField[] = [
  {
    type: 'input',
    value: 'CHENY',
    prop: 'username',
    placeholder: '请输入用户名',
    rules: [required('用户名')],
    attrs: {
      clearable: true,
      prefixIcon: 'user',
    },
  },
  {
    type: 'input',
    value: '123456',
    placeholder: '请输入密码',
    prop: 'password',
    rules: [required('密码'), length('密码', 6, 15)],
    attrs: {
      type: 'password',
      showPasswordOn: 'mousedown',
      clearable: true,
    },
  },
]
