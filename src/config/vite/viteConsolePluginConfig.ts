/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 14:09:46
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-17 16:54:27
 * @FilePath: \Robot_Admin\src\config\vite\viteConsolePluginConfig.ts
 * @Description: Vite 控制台插件配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import viteConsolePlugin from 'vite-console-plugin'
import packageJson from '../../../package.json'

export default viteConsolePlugin({
  systemName: packageJson.name,
  version: `v${packageJson.version} (开发版)`,
  team: '信息化部-业务2室西安领域',
  owner: 'CHENY | 编号: 409322',
})
