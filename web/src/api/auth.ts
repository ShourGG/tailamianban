import { postData } from '@/axios/request'
import DynamicRouter from '@/assets/data/dynamicRouter.json'
import type { PostAuthLoginData, PostAuthLoginResponse } from './generated'

export type LoginResponse = PostAuthLoginResponse

/**
 * * @description: 用户登录接口
 * ? @param {NonNullable<PostAuthLoginData['body']>} data 登录表单数据，包含用户名和密码
 * ! @return {Promise<PostAuthLoginResponse>} 登录响应数据，包含用户信息和token
 */

export const loginApi = (data: NonNullable<PostAuthLoginData['body']>) =>
  postData<PostAuthLoginResponse>('/auth/login', data)

/**
 * * @description: 获取用户菜单权限列表
 * ! @return {any} 动态菜单路由配置数据
 */
export const getAuthMenuListApi = () => DynamicRouter
