/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-12 22:07:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-09 20:19:02
 * @FilePath: \Robot_Admin\src\plugins\loading.ts
 * @Description: 项目启动时的加载动画
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

//? 修改样式只需调整STYLE常量
//? 修改结构只需调整HTML常量
//? 类名变更只需修改CLASS常量

/**
 * @description: 设置加载动画
 * @return {*} {void}
 */
export function setupLoading() {
  // 常量定义
  const CLASS = {
    loading: 'app-loading',
    wrap: 'app-loading-wrap',
    logo: 'app-loading-logo',
    dots: 'loading-dots',
    title: 'app-loading-title',
  }

  // 检查是否已存在加载结构，避免重复
  if (document.querySelector(`.${CLASS.loading}`)) return

  // ====== 内联关键结构到HTML ======
  const loadingHTML = `
    <div class="${CLASS.loading}" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      z-index: 9999;
    ">
      <div class="${CLASS.wrap}" style="
        text-align: center;
        transform: translateY(10%);
        width: 100%;
      ">
        <div class="${CLASS.loading}-logo-container" style="
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
        ">
        <img src="/robot.gif"
               class="${CLASS.logo}"
               style="width: 280px; height: 280px;"
               alt="Loading" />
        </div>
        <div class="${CLASS.dots}" style="
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 0 auto 30px;
        ">
          <span style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #1677ff;
            animation: pulse 1.4s infinite ease-in-out;
          "></span>
          <span style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #1677ff;
            animation: pulse 1.4s infinite ease-in-out 0.2s;
          "></span>
          <span style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #1677ff;
            animation: pulse 1.4s infinite ease-in-out 0.4s;
          "></span>
          <span style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #1677ff;
            animation: pulse 1.4s infinite ease-in-out 0.6s;
          "></span>
        </div>
        <h1 class="${CLASS.title}" style="
          color:#1677ff;
          font-size: 1.6rem;
          font-weight: bold;
          letter-spacing: 1.5px;
          opacity: 0;
          animation: fadeIn 0.3s ease-out 0.1s forwards;
        ">Robot Admin</h1>
      </div>
    </div>
  `

  // 插入内联结构 - 确保立即显示
  document.body.insertAdjacentHTML('afterbegin', loadingHTML)

  // ====== 动态添加关键帧和细节样式 ======
  const style = document.createElement('style')
  // 🔧 关键修复：给样式表添加唯一标识
  style.setAttribute('data-loading-styles', 'true')
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(0.8); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    /* 仅保留动态部分样式 */
    .${CLASS.loading} {
      z-index: 9999;
    }
    .${CLASS.logo} {
      animation: bounce 1s infinite ease-in-out;
    }
  `
  document.head.appendChild(style)

  // 确保图片加载完成
  const logo = document.querySelector(
    `.${CLASS.logo}`
  ) as HTMLImageElement | null
  if (logo) {
    logo.onload = () => {
      logo.style.opacity = '1'
    }
    if (logo.complete) logo.style.opacity = '1'
  }

  // 监听加载完成事件
  window.addEventListener('load', () => {
    setTimeout(removeLoading, 300) // 延迟500ms确保动画完整显示
  })

  // 设置最大等待时间
  setTimeout(removeLoading, 1000)
}

/**
 * @description: 移除加载动画
 * @return {*} {void}
 */
export function removeLoading() {
  const CLASS = {
    loading: 'app-loading',
    wrap: 'app-loading-wrap',
    logo: 'app-loading-logo',
    dots: 'loading-dots',
    title: 'app-loading-title',
  }

  const loading = document.querySelector(
    `.${CLASS.loading}`
  ) as HTMLElement | null
  if (!loading) return

  // 添加淡出动画
  loading.style.transition = 'opacity 0.4s ease-out'
  loading.style.opacity = '0'

  // 动画结束后移除
  setTimeout(() => {
    loading.remove()

    // 只删除我们自己创建的样式表，不要误删其他样式
    const loadingStyles = document.querySelectorAll(
      'style[data-loading-styles="true"]'
    ) as NodeListOf<HTMLStyleElement>

    loadingStyles.forEach(style => {
      style.remove()
    })

    // 恢复默认背景色
    document.documentElement.style.backgroundColor = ''
    document.body.style.backgroundColor = ''
  }, 400)
}
