/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 15:47:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-17 16:00:54
 * @FilePath: \Robot_Admin\src\config\vite\viteSereverConfig.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

export default {
  port: 1988,
  hmr: { overlay: true },
  proxy: {
    '^/api': {
      target: 'https://apifoxmock.com/m1/4902805-4559325-default', //代理接口
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
  },
}
