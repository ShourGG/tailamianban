import { postData, getData, deleteData } from '@/axios/request'
import DynamicRouter from '@/assets/data/dynamicRouter.json'
import type {
  PostAuthLoginData,
  PostAuthLoginResponse,
  GetEmployeesListResponse,
  DeleteEmployeesByIdResponse,
} from './generated'

export type LoginResponse = PostAuthLoginResponse
export type DeleteEmployeeResponse = DeleteEmployeesByIdResponse

export const loginApi = (data: NonNullable<PostAuthLoginData['body']>) =>
  postData<PostAuthLoginResponse>('/auth/login', data)

export const getEmployeesListApi = () =>
  getData<GetEmployeesListResponse>('/employees/list')

export const deleteEmployeeApi = (id: number) =>
  deleteData<DeleteEmployeesByIdResponse>(`/employees/${id}`)

export const getAuthMenuListApi = () => DynamicRouter
