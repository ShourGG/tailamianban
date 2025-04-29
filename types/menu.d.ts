namespace Menu {
  interface MenuOptions {
    path: string
    name: string
    component?: string
    meta?: {
      hidden?: boolean
      keepAlive?: boolean
      // 添加其他需要的元数据字段
    }
    children?: MenuOptions[]
  }
}
