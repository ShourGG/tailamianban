import { postData, getData } from '@/axios/request'
import DynamicRouter from '@/assets/data/dynamicRouter.json'
import type { PostAuthLoginData, PostAuthLoginResponse } from './generated'

export type LoginResponse = PostAuthLoginResponse

export interface RegisterData {
  username: string
  password: string
  email?: string
}

export interface CheckInitResponse {
  initialized: boolean
  message: string
}

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

/**
 * * @description: 检查系统是否已初始化（是否有用户）
 * ! @return {Promise<CheckInitResponse>} 初始化状态
 */
export const checkInitApi = () => getData<CheckInitResponse>('/auth/check-init')

/**
 * * @description: 注册首个管理员账户（仅在无用户时可用）
 * ? @param {RegisterData} data 注册表单数据，包含用户名、密码和可选的邮箱
 * ! @return {Promise<LoginResponse>} 注册响应数据
 */
export const registerApi = (data: RegisterData) =>
  postData<LoginResponse>('/auth/register', data)
