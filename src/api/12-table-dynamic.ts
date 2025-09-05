import { getData } from '@/axios/request'
import type { GetEmployeesDynamicListResponse } from './generated'

/**
 * @description: 获取员工动态管理列表接口
 * @param options 查询参数，包含分页和过滤条件
 * @return {Promise<GetEmployeesDynamicListResponse>} 员工动态管理列表响应数据
 */
export const getDynamicEmployeesListApi = (
  options: {
    page?: number
    pageSize?: number
    department?: string
    status?: string
    keyword?: string
  } = {}
) => {
  const params = new URLSearchParams()

  // 设置默认分页
  params.append('page', String(options.page || 1))
  params.append('pageSize', String(options.pageSize || 10))

  // 添加可选过滤参数
  if (options.department) params.append('department', options.department)
  if (options.status) params.append('status', options.status)
  if (options.keyword) params.append('keyword', options.keyword)

  return getData<GetEmployeesDynamicListResponse>(
    `/employees/dynamicList?${params}`
  )
}
