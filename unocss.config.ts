/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-18 10:03:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 16:35:15
 * @FilePath: \Robot_Admin\unocss.config.ts
 * @Description: unocss 主配置文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  transformerDirectives,
} from 'unocss'

import rules from './src/styles/preset/rules'

import { iconSafelist } from './src/utils/unocss/icon-safelist'
import { shortcutsArr } from './src/utils/unocss/shortcuts-arr'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [transformerDirectives()],
  rules,
  shortcuts: shortcutsArr,
  safelist: iconSafelist,
})
