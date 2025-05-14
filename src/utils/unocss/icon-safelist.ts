/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 14:12:17
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-14 15:24:42
 * @FilePath: \Robot_Admin\src\utils\unocss\icon-safelist.ts
 * @Description: 处理动态加载图标的白名单，配合unocss.config，解决按需加载无法动态的情况
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import * as IconsIconifyMdi from '@iconify-json/mdi'

// 这里的100是为了限制图标数量，避免过多的图标影响性能

export const iconSafelist = [
  // 原有动态生成的图标
  ...Object.entries(IconsIconifyMdi.chars)
    .slice(0, 100)
    .map(([, name]) => `i-mdi:${name}`),

  // 新增静态图标类名
  'i-mdi:monitor-dashboard',
  'i-mdi:account-multiple-outline',
]
