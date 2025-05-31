/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 11:01:16
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-31 11:07:01
 * @FilePath: \Robot_Admin\src\types\global.d.ts
 * @Description: 全局命名空间和工具类型
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { VNode, CSSProperties } from 'vue'

declare global {
  // =================== 应用全局命名空间 ===================
  namespace App {
    /** 应用配置 */
    interface Config {
      name: string
      version: string
      title: string
      description?: string
      author?: string
    }

    /** 应用主题配置 */
    interface ThemeConfig {
      mode: 'light' | 'dark' | 'auto'
      primaryColor: string
      borderRadius: number
      fontSize: number
    }
  }

  // =================== 组件通用命名空间 ===================
  namespace Component {
    /** 组件大小 */
    type Size = 'small' | 'medium' | 'large'

    /** 组件状态 */
    type Status = 'default' | 'success' | 'warning' | 'error' | 'info'

    /** 组件变体 */
    type Variant = 'solid' | 'outline' | 'ghost' | 'text'

    /** 通用组件 Props */
    interface BaseProps {
      class?: string
      style?: string | CSSProperties
      id?: string
      disabled?: boolean
      loading?: boolean
    }
  }

  // =================== 通用工具类型 ===================

  /** 可选的部分属性 */
  type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

  /** 必需的部分属性 */
  type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

  /** 深度可选 */
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
  }

  /** 深度必需 */
  type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
  }

  /** 值类型 */
  type ValueOf<T> = T[keyof T]

  /** 键类型 */
  type KeyOf<T> = keyof T

  /** 记录类型 */
  type RecordType<
    K extends string | number | symbol = string,
    V = any,
  > = Record<K, V>

  /** 函数类型 */
  type Fn<T = any, R = T> = (...args: T[]) => R

  /** 异步函数类型 */
  type AsyncFn<T = any, R = T> = (...args: T[]) => Promise<R>

  /** 可空类型 */
  type Nullable<T> = T | null

  /** 可未定义类型 */
  type Undefinable<T> = T | undefined

  /** 可空或未定义类型 */
  type Maybe<T> = T | null | undefined

  /** 排除函数属性 */
  type NonFunctionKeys<T> = {
    [K in keyof T]: T[K] extends Function ? never : K
  }[keyof T]

  /** 仅函数属性 */
  type FunctionKeys<T> = {
    [K in keyof T]: T[K] extends Function ? K : never
  }[keyof T]
}

export {}
