<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-19 17:53:53
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-19 17:55:16
 * @FilePath: \Robot_Admin\src\components\icons\iconRobot.vue
 * @Description: 机器人logo
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 背景 -->
    <rect
      width="24"
      height="24"
      fill="#3B82F6"
    />

    <!-- 机器人头部主要部分 (浅灰色) -->
    <path
      d="M5 8C5 6.89543 5.89543 6 7 6H17C18.1046 6 19 6.89543 19 8V15H5V8Z"
      fill="#E5E7EB"
    />
    <!-- 机器人下巴/颈部 (浅灰色) -->
    <rect
      x="5"
      y="15"
      width="14"
      height="3"
      fill="#E5E7EB"
    />

    <!-- 机器人眼睛/面罩 (深灰色) -->
    <rect
      x="7"
      y="9"
      width="10"
      height="4"
      rx="1"
      fill="#1F2937"
    />
    <!-- 面罩高光 (亮蓝色) -->
    <path
      d="M7.5 10.5H10"
      stroke="#7DD3FC"
      stroke-width="1"
      stroke-linecap="round"
    />

    <!-- 机器人侧面细节/耳朵 (灰色) -->
    <rect
      x="4"
      y="9"
      width="1"
      height="5"
      fill="#D1D5DB"
    />
    <!-- 左耳 -->
    <rect
      x="19"
      y="9"
      width="1"
      height="5"
      fill="#D1D5DB"
    />
    <!-- 右耳 -->
  </svg>
</template>
