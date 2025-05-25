/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-25 22:51:06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-25 23:34:50
 * @FilePath: \Robot_Admin\src\plugins\passive-scroll.ts
 * @Description: 消除控制台滚动警告
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'

type Options = {
  eventTypes?: string[]
  debug?: boolean
}

export const PassiveScrollPlugin = {
  /**
   * * @description: 消除控制台滚动警告插件
   * ? @param {App} app Vue应用实例
   * ? @param {Options} options 可选参数，默认值为 { eventTypes: ['wheel','mousewheel'], debug: false }
   * ! @return {*}
   */
  install(app: App, options: Options = {}) {
    if (typeof window === 'undefined') return

    const { eventTypes = ['wheel', 'mousewheel'], debug = false } = options
    const originalAdd = EventTarget.prototype.addEventListener

    /**
     * 添加时间源原型方法过滤
     */
    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      if (eventTypes.includes(type)) {
        options =
          typeof options === 'boolean'
            ? { capture: options, passive: true }
            : { ...options, passive: true }

        if (debug) {
          console.error('[PassiveScroll] Applied to:', this, type)
        }
      }
      return originalAdd.call(this, type, listener, options)
    }
  },
}
