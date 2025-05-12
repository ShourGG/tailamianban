//* 处理动画组件的工具函数

import { type ClassValue, clsx } from 'clsx'

/**
 * @description:  三方库 - 合并类名
 * @param {array} inputs
 * @return {*}
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export type ObjectValues<T> = T[keyof T]
