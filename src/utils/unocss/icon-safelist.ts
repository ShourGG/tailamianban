/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 14:12:17
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 14:26:15
 * @FilePath: \Robot_Admin\src\utils\icon-safelist.ts
 * @Description: 处理动态加载图标的白名单，配合unocss.config，解决按需加载无法动态的情况
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import * as IconsIconifyMdi from '@iconify-json/mdi'

// 这里的100是为了限制图标数量，避免过多的图标影响性能

export const iconSafelist = Object.entries(IconsIconifyMdi.chars)
  .slice(0, 100)
  .map(([, name]) => `i-mdi-${name}`)
