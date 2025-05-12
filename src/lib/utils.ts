import { type ClassValue, clsx } from 'clsx'

/**
 * @description:  三方库 - 合并类名
 * @param {array} inputs
 * @return {*}
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// ... 保持其他工具函数不变

export type ObjectValues<T> = T[keyof T]
