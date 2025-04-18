/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-18 10:02:35
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-18 14:10:30
 * @FilePath: \bun_vite_uno_naive\src\styles\preset\rules.ts
 * @Description: 维护自定义原子规则
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// MARK: 维护自定义原子规则

const rules: Array<
  [RegExp, (match: RegExpMatchArray) => Record<string, string>]
> = [
  [
    /^fs-(\d+)$/,
    (match: RegExpMatchArray): Record<string, string> => {
      const d = match[1]
      return d?.length ? { 'font-size': `${Number(d) / 4}rem` } : {}
    },
  ],
  [
    /^pd-(\d+)$/,
    (match: RegExpMatchArray): Record<string, string> => {
      const d = match[1]
      return d?.length ? { padding: `${d}px` } : {}
    },
  ],
]
export default rules
