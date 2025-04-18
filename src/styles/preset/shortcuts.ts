/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-18 10:02:25
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-18 13:56:55
 * @FilePath: \bun_vite_uno_naive\src\styles\preset\shortcuts.ts
 * @Description: 维护快捷类组合
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// MARK: 维护语义化组合类

const shortcuts: Array<[string, string]> = [
  // 布局类
  ['flex-center', 'flex justify-center items-center'],
  ['flex-col-center', 'flex flex-col justify-center items-center'],

  // 文字类
  ['text-header', 'text-2.4rem font-600 tracking-wide'],
  ['text-subtitle', 'text-1.2rem text-gray-500 dark:text-gray-300'],

  // 按钮类
  [
    'btn-primary',
    'px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white',
  ],
]

export default shortcuts
