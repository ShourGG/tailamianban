import { postData, getData } from '@/axios/request'
import DynamicRouter from '@/assets/data/dynamicRouter.json'
import type {
  PostAuthLoginData,
  PostAuthLoginResponse,
  GetEmployeesListResponse,
} from './generated'

export type LoginResponse = PostAuthLoginResponse

export const loginApi = (data: NonNullable<PostAuthLoginData['body']>) =>
  postData<PostAuthLoginResponse>('/auth/login', data)

export const getEmployeesListApi = () =>
  getData<GetEmployeesListResponse>('/employees/list')

export const getAuthMenuListApi = () => DynamicRouter
