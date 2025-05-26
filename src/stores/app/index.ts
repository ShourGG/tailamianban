/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2022-04-10 23:20:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-26 19:45:24
 * @FilePath: \Robot_Admin\src\stores\app\index.ts
 * @Description: 应用相关存储
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

export const s_appStore = defineStore('app', {
  state: () => ({
    tagsViewList: [] as Tag[],
    activeTag: '',
  }),

  actions: {
    initTags(tags?: Tag[]) {
      if (tags) {
        this.tagsViewList = tags
        this.ensureCurrentRouteTag()
      } else {
        this.tagsViewList = [
          ...new Map(this.tagsViewList.map(tag => [tag.path, tag])).values(),
        ]
      }
    },

    ensureCurrentRouteTag() {
      const route = useRoute()
      if (route.path && !this.tagsViewList.some(t => t.path === route.path)) {
        this.addTag({
          path: route.path,
          title: (route.meta.title as string) || 'Unnamed Page',
          icon: route.meta.icon as string,
          meta: { affix: route.meta.affix as boolean },
        })
      }
    },

    setActiveTag(path: string) {
      this.activeTag = path
    },

    addTag(tag: Tag) {
      if (!this.tagsViewList.some(item => item.path === tag.path)) {
        this.tagsViewList.push(tag)
        this.setActiveTag(tag.path)
      }
    },

    removeTag(index: number) {
      if (index >= 0 && index < this.tagsViewList.length) {
        return this.tagsViewList.splice(index, 1)[0]?.path
      }
      return null
    },

    removeOtherTags(index: number) {
      if (index === 0) {
        this.tagsViewList = [this.tagsViewList[0]].filter(Boolean)
      } else {
        this.tagsViewList = [
          this.tagsViewList[0],
          this.tagsViewList[index],
        ].filter(Boolean)
      }
    },

    removeLeftTags(index: number) {
      this.tagsViewList = [
        this.tagsViewList[0],
        ...this.tagsViewList.slice(index),
      ]
    },

    removeRightTags(index: number) {
      this.tagsViewList = this.tagsViewList.slice(0, index + 1)
    },

    removeAllTags() {
      this.tagsViewList = this.tagsViewList.filter(tag => tag.meta?.affix)
    },
  },

  persist: true,
})
