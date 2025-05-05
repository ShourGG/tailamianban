/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-15 21:01:38
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-01 22:58:54
 * @FilePath: \Robot_Admin\src\utils\v_verify.ts
 * @Description: 表单校验规则
 */

import type { FormItemRule } from 'naive-ui'

export type FieldRule = Omit<FormItemRule, 'validator'> & {
  validator: NonNullable<FormItemRule['validator']>
}

const MOBILE_REGEX = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/
const ID_CARD_REGEX = /^\d{15}$|^\d{18}$|^\d{17}[\dXx]$/

/**
 * @description: 核心生成器，生成规则
 * @return {*} {FieldRule} 规则对象
 */
function createRule(
  trigger: FieldRule['trigger'] = 'blur',
  validateFn: (v: string) => boolean,
  message: string
): FieldRule {
  return {
    trigger,
    validator: async (_: any, value: string) => {
      if (!validateFn(value)) throw new Error(message)
    },
    message,
  }
}

// 预设规则库
export const PRESET_RULES = {
  required: (field: string) =>
    createRule(
      ['blur', 'input'],
      v => !!v && String(v).trim() !== '',
      `${field}不能为空`
    ),
  length: (field: string, min: number, max: number) =>
    createRule(
      'blur',
      v => v?.length >= min && v?.length <= max,
      `${field}长度需在${min}-${max}位之间`
    ),
  mobile: createRule('blur', v => MOBILE_REGEX.test(v), '手机号格式错误'),
  idCard: createRule('blur', v => ID_CARD_REGEX.test(v), '身份证号格式错误'),
}

// 自定义规则构造器
export const customRule = (
  validateFn: (v: string) => boolean,
  message: string,
  trigger: FieldRule['trigger'] = 'blur'
) => createRule(trigger, validateFn, message)

/**
 * @description: 私有方法_，合并多条规则为一个串行validator，只显示第一个未通过的提示
 * @param {FieldRule} rules 规则数组
 * @return {*}
 */
export function _mergeRules(rules: FormItemRule[]): FormItemRule[] {
  if (rules.length <= 1) return rules
  return [
    {
      trigger: ['blur', 'input'],
      validator: async (_, value) => {
        for (const rule of rules) {
          // eslint-disable-next-line no-await-in-loop
          await rule.validator?.(rule, value, () => {}, {}, {})
        }
      },
    },
  ]
}

//TAG:  使用示例可以参考 @/views/login/data.ts 文件中的使用示例
