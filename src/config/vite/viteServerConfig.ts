/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 15:47:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-06 12:42:35
 * @FilePath: \Robot_Admin\src\config\vite\viteServerConfig.ts
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

export default {
  port: 1988,
  hmr: { overlay: true },
  open: true,
  proxy: {
    '^/api': {
      target: 'http://localhost:8080', // 泰拉瑞亚面板后端API
      changeOrigin: true,
      secure: false
    },
    '^/ws': {
      target: 'ws://localhost:8080', // WebSocket连接
      ws: true,
      changeOrigin: true
    }
  },
}
