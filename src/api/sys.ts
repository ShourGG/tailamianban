import request from '@/axios/request'
import DynamicRouter from '@/assets/dynamicRouter.json'

// 登录接口
export const login = (data: unknown) => {
  return request({
    url: '/sys/login',
    method: 'POST',
    data,
  })
}

// 获取用户信息接口
export const getUserInfo = () => {
  return request({
    url: '/sys/profile',
  })
}

// 获取菜单列表
export const getAuthMenuListApi = () => {
  // return request({
  //   url: '/sys/menu/list',
  // })
  // 暂时使用本地数据
  return DynamicRouter
}
