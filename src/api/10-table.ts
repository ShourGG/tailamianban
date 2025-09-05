import { getData, deleteData, putData } from '@/axios/request'
import type {
  GetEmployeesListResponse,
  DeleteEmployeesByIdResponse,
  GetEmployeesByIdResponse,
  PutEmployeesByIdResponse,
} from './generated'

/**
 * * @description: 获取员工列表接口
 * ! @return {Promise<GetEmployeesListResponse>} 员工列表响应数据，包含分页信息
 */
export const getEmployeesListApi = (params: any) =>
  getData<GetEmployeesListResponse>('/employees/list', { params })

/**
 * * @description: 根据ID查询员工详情接口
 * ? @param {number} id 员工唯一标识ID
 * ! @return {Promise<GetEmployeesByIdResponse>} 员工详情响应数据
 */
export const getEmployeeByIdApi = (id: number) =>
  getData<GetEmployeesByIdResponse>(`/employees/${id}`)

/**
 * * @description: 更新员工信息接口
 * ? @param {number} id 员工唯一标识ID
 * ? @param {object} data 更新的员工数据对象
 * ! @return {Promise<PutEmployeesByIdResponse>} 更新后的员工信息响应数据
 */
export const updateEmployeeApi = (id: number, data: any) =>
  putData<PutEmployeesByIdResponse>(`/employees/${id}`, data)

/**
 * * @description: 删除员工接口
 * ? @param {number} id 员工唯一标识ID
 * ! @return {Promise<DeleteEmployeesByIdResponse>} 删除响应数据，包含被删除的员工信息
 */
export const deleteEmployeeApi = (id: number) =>
  deleteData<DeleteEmployeesByIdResponse>(`/employees/${id}`)
