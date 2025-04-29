/*
 * @Author: ChenYu
 * @Date: 2022-04-10 23:20:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-29 16:10:47
 * @FilePath: \Robot_Admin\src\stores\app\index.ts
 * @Description: 应用相关仓储
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */
import { LANG, TAGS_VIEW } from '@/constant'
import { getItem, setItem } from '@/hooks/useStorage'

export interface I_Payload {
  type: 'index' | 'other' | 'right'
  index: number
}

/** TODO:
 *  1. 定义并导出容器
 *   参数1： 容器的 ID , 必须唯一， 将来 Pinia 会把所有的容器挂载到跟容器
 *   参数2： 选项对象
 *   返回值： 一个函数, 调用得到容器实例
 */

export const s_appStore = defineStore('app', {
  state: () => {
    return {
      language: getItem(LANG) || 'zh',
      tagsViewList: getItem(TAGS_VIEW) || [],
    }
  },

  getters: {},

  actions: {
    setLanguage(lang: string) {
      // 设置语言
      setItem(LANG, lang)
      this.language = lang
    },

    addTagesViewList(tag: { path: string }) {
      // 处理重复
      const isFind = this.tagsViewList.find(
        (item: { path: string }) => item.path === tag.path
      )
      if (!isFind) {
        this.tagsViewList.push(tag)
        setItem(TAGS_VIEW, this.tagsViewList)
      }
    },
    // 为指定的 tag 修改 title 用于中英文切换
    changeTagesView({ index, tag }: { index: number; tag: { path: string } }) {
      this.tagsViewList[index] = tag
      setItem(TAGS_VIEW, this.tagsViewList)
    },
    /**
     * @description: 删除 TagsView 相关操作
     * @param {*} payload {type: other || right || 'index'}
     */
    removeTagsView(payload: I_Payload): void {
      if (payload.type === 'index') {
        this.tagsViewList.splice(payload.index, 1)
      } else if (payload.type === 'other') {
        this.tagsViewList.splice(
          payload.index + 1,
          this.tagsViewList.length - payload.index + 1
        )
        this.tagsViewList.splice(0, payload.index)
      } else if (payload.type === 'right') {
        this.tagsViewList.splice(
          payload.index + 1,
          this.tagsViewList.length - payload.index + 1
        )
      }
      setItem(TAGS_VIEW, this.tagsViewList)
    },
  },
})
