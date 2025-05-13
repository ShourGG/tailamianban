/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-12 22:07:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-13 09:25:41
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

  // ====== 立即设置背景色防闪 ======
  document.documentElement.style.backgroundColor = '#fff'
  document.body.style.backgroundColor = '#fff'

  // ====== 同步插入完整结构 ======
  const loadingHTML = `
    <div class="${CLASS.loading}">
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
  loader.innerHTML = loadingHTML
  document.body.appendChild(loader)

  // ====== 添加样式 ======
  const style = document.createElement('style')
  style.textContent = `
    /* 主容器样式 */
    .${CLASS.loading} {
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
      width: 280px;
      height: 280px;
    }

    /* 点状动画 */
    .${CLASS.dots} {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 0 auto 30px;
    }

    .${CLASS.dots} span {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #1677ff;
      animation: pulse 1.4s infinite ease-in-out;
    }

    .${CLASS.dots} span:nth-child(2) { animation-delay: 0.2s; }
    .${CLASS.dots} span:nth-child(3) { animation-delay: 0.4s; }
    .${CLASS.dots} span:nth-child(4) { animation-delay: 0.6s; }

    /* 标题 */
  .${CLASS.title} {
    color: #1677ff;
    font-size: 2.4rem;
    font-weight: bold;
    letter-spacing: 1.5px;
    opacity: 0;
    animation: fadeIn 0.6s ease-out 0.3s forwards;
  }

  /* 新增淡入关键帧 */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  `
  document.head.appendChild(style)

  // ====== 移除逻辑 ======
  const removeLoading = () => {
    const loading = document.querySelector(`.${CLASS.loading}`)
    if (loading) {
      loading.remove()
    }
    // 恢复默认背景色
    document.documentElement.style.backgroundColor = ''
    document.body.style.backgroundColor = ''
  }

  // 监听加载完成事件
  window.addEventListener('load', () => {
    setTimeout(removeLoading, 300) // 延迟500ms确保动画完整显示
  })

  // 设置最大等待时间
  setTimeout(removeLoading, 1000)
}
