/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 16:15:44
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-02 22:41:25
 * @FilePath: \Robot_Admin\src\hooks\useDownload\index.ts
 * @Description: 下载文件 hook 封装 - 支持 Excel 导出
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { createDiscreteApi } from 'naive-ui/es'

const { notification } = createDiscreteApi(['notification'])

export const useDownload = async (
  api: (param: Record<string, unknown>) => Promise<Blob>,
  tempName: string,
  params: Record<string, unknown> = {},
  isNotify = true,
  fileType = '.xlsx'
): Promise<void> => {
  try {
    if (isNotify) {
      notification.warning({
        content: '大型文件下载可能需要较长时间，请耐心等待',
        duration: 1500,
      })
    }

    const blob = new Blob([await api(params)], {
      type:
        fileType === '.xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : undefined,
    })

    // Edge 兼容处理
    if ('msSaveOrOpenBlob' in navigator) {
      return (
        navigator as Navigator & {
          msSaveOrOpenBlob?: (blob: Blob, fileName: string) => void
        }
      ).msSaveOrOpenBlob!(blob, `${tempName}${fileType}`)
    }

    // 现代浏览器处理
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    try {
      Object.assign(link, {
        href: url,
        download: `${tempName}${fileType}`,
        style: 'display: none',
      })

      document.body.append(link)
      link.click()
    } finally {
      setTimeout(() => {
        link.remove()
        URL.revokeObjectURL(url)
      }, 100)
    }
  } catch (error) {
    throw new Error(
      `导出失败：${error instanceof Error ? error.message : '未知错误'}`
    )
  }
}
