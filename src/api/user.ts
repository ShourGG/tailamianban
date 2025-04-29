/*
 * @Author: ChenYu
 * @Date: 2022-04-18 11:40:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-01 11:11:39
 * @FilePath: \vue3_vite3_element-plus_admin\src\api\user.ts
 * @Description: 用户相关接口
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 *
 *
 */

import request from '@/axios/request'

export const feature = () => {
  return request({
    url: '/user/feature',
  })
}

export const chapter = () => {
  return request({
    url: '/user/chapter',
  })
}
