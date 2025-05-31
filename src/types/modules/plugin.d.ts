/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 14:04:47
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-31 14:04:52
 * @FilePath: \Robot_Admin\src\types\modules\plugin.d.ts
 * @Description: 插件模块声明
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

declare module '@/plugins/naive-ui' {
  import type { App } from 'vue'
  export function setupNaiveUI(app: App): void
}
