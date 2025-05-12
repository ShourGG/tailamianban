/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-12 22:07:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-13 00:17:22
 * @FilePath: \Robot_Admin\src\plugins\loading.ts
 * @Description: 项目启动时的加载动画
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

//* 修改样式只需调整STYLE常量
//* 修改结构只需调整HTML常量
//* 类名变更只需修改CLASS常量

/**
 * @description: 超大尺寸居中加载动画
 * @return {void}
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

  // ====== 预渲染防闪烁 ======
  const antiFlashStyle = document.createElement('style')
  antiFlashStyle.textContent = `
    body { opacity: 0; transition: opacity 0.15s ease-out; }
    body.app-loading-visible { opacity: 1; }
  `
  document.head.appendChild(antiFlashStyle)

  // ====== 同步插入完整结构 ======
  const HTML = `
    <div class="${CLASS.loading}" style="opacity:0">
      <div class="${CLASS.wrap}">
        <div class="${CLASS.loading}-logo-container">
          <img src="/src/assets/images/机器人.gif"
               class="${CLASS.logo}"
               alt="Loading" />
        </div>
        <div class="${CLASS.dots}">
          ${Array.from({ length: 4 }, () => '<span></span>').join('')}
        </div>
        <h1 class="${CLASS.title}">ROBOT ADMIN</h1>
      </div>
    </div>
  `

  const loader = document.createElement('div')
  loader.innerHTML = HTML
  document.body.appendChild(loader)

  // ====== 分阶段显示 ======
  const STYLE = `
    /* 主容器样式 */
    .${CLASS.loading} {
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      z-index: 9999;
      transition: opacity 0.3s;
    }

    /* 内容包裹层 */
    .${CLASS.wrap} {
      text-align: center;
      transform: translateY(10%);
      width: 100%;
    }

    /* 机器人容器 */
    .${CLASS.loading}-logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 40px;
    }

    /* 超大机器人图片 */
    .${CLASS.logo} {
      width: 320px;
      height: 320px;
      // opacity: 0;
      // transition: opacity 0.3s ease-out 0.1s;
    }

    /* 点状动画 */
    .${CLASS.dots} {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 0 auto 30px;
      width: fit-content;
    }

    /* 大号点状动画 */
    .${CLASS.dots} span {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #1677ff;
      animation: pulse 1.4s infinite ease-in-out;
    }

    /* 点动画延迟 */
    .${CLASS.dots} span:nth-child(2) { animation-delay: 0.2s; }
    .${CLASS.dots} span:nth-child(3) { animation-delay: 0.4s; }
    .${CLASS.dots} span:nth-child(4) { animation-delay: 0.6s; }

    /* 超大标题 */
    .${CLASS.title} {
      margin: 0 auto;
      width: fit-content;
      color: #1677ff;
      font-size: 3rem;
      font-weight: bold;
      letter-spacing: 1.5px;
      opacity: 0;
      transition: opacity 0.3s ease-out;
    }

    /* 点动画关键帧 */
    @keyframes pulse {
      0%, 40%, 100% { transform: scale(0.8); }
      20% { transform: scale(1.2); }
    }
  `

  const style = document.createElement('style')
  style.textContent = STYLE
  document.head.appendChild(style)

  // ====== 分步显示动画 ======
  setTimeout(() => {
    // 1. 显示body
    document.body.classList.add('app-loading-visible')

    // 2. 显示加载容器
    const loadingEl = document.querySelector(`.${CLASS.loading}`) as HTMLElement
    loadingEl.style.opacity = '1'

    // 3. 显示图片（延迟100ms）
    setTimeout(() => {
      const logo = document.querySelector(`.${CLASS.logo}`) as HTMLElement
      logo.style.opacity = '1'
    }, 100)

    // 4. 显示标题（延迟200ms）
    setTimeout(() => {
      const title = document.querySelector(`.${CLASS.title}`) as HTMLElement
      title.style.opacity = '1'
    }, 200)
  }, 10)

  // ====== 移除逻辑 ======
  const remove = () => {
    const el = document.querySelector(`.${CLASS.loading}`) as HTMLElement
    if (el) {
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 300)
    }
  }

  window.addEventListener('DOMContentLoaded', remove)
  setTimeout(remove, 1000)
}
