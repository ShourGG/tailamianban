<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-28 11:26:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-28 14:58:28
 * @FilePath: \Robot_Admin\src\views\demo\02-area-cascade\index.vue
 * @Description: 级联选择器示例
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<script setup lang="ts">
  import pcaCode from '@/assets/data/pca-code.json'

  // 定义级联选择器选中值的接口
  interface CascadeOption {
    label: string
    value: string | number
  }

  // 使用更具描述性的命名
  interface CascadeSelected {
    primary?: CascadeOption | null // 第一级选项
    secondary?: CascadeOption | null // 第二级选项
    tertiary?: CascadeOption | null // 第三级选项
  }

  // 定义级联数据项接口
  interface CascadeItem {
    label: string
    value: string | number
    children?: CascadeItem[]
  }

  // 定义级联选择器配置接口
  interface CascadeConfig {
    id: string
    title: string
    data: CascadeItem[]
    selected: CascadeSelected
    placeholders: string[]
    type?: string
    labels: {
      primary: string // 第一级标签
      secondary: string // 第二级标签
      tertiary: string // 第三级标签
    }
  }

  // 转换省市区数据为级联组件需要的格式
  const cityData = pcaCode.map(province => ({
    label: province.name,
    value: province.code,
    children: province.children?.map(city => ({
      label: city.name,
      value: city.code,
      children: city.children?.map(area => ({
        label: area.name,
        value: area.code,
      })),
    })),
  }))

  // 技术分类数据
  const techData = [
    {
      label: '前端开发',
      value: 'frontend',
      children: [
        {
          label: 'Vue',
          value: 'vue',
          children: [
            { label: 'Vue 2.x', value: 'vue2' },
            { label: 'Vue 3.x', value: 'vue3' },
            { label: 'Vuex', value: 'vuex' },
            { label: 'Vue Router', value: 'vue-router' },
          ],
        },
        {
          label: 'React',
          value: 'react',
          children: [
            { label: 'React Hooks', value: 'hooks' },
            { label: 'Redux', value: 'redux' },
            { label: 'React Router', value: 'react-router' },
          ],
        },
        {
          label: '工具链',
          value: 'tools',
          children: [
            { label: 'Webpack', value: 'webpack' },
            { label: 'Vite', value: 'vite' },
            { label: 'TypeScript', value: 'typescript' },
          ],
        },
      ],
    },
    {
      label: '后端开发',
      value: 'backend',
      children: [
        {
          label: 'Node.js',
          value: 'nodejs',
          children: [
            { label: 'Express', value: 'express' },
            { label: 'Koa', value: 'koa' },
            { label: 'NestJS', value: 'nestjs' },
          ],
        },
        {
          label: 'Python',
          value: 'python',
          children: [
            { label: 'Django', value: 'django' },
            { label: 'Flask', value: 'flask' },
            { label: 'FastAPI', value: 'fastApi' },
          ],
        },
      ],
    },
    {
      label: '数据库',
      value: 'database',
      children: [
        {
          label: '关系型',
          value: 'sql',
          children: [
            { label: 'MySQL', value: 'mysql' },
            { label: 'PostgreSQL', value: 'postgresql' },
          ],
        },
        {
          label: '非关系型',
          value: 'nosql',
          children: [
            { label: 'MongoDB', value: 'mongodb' },
            { label: 'Redis', value: 'redis' },
          ],
        },
      ],
    },
  ]

  // 组织架构数据
  const orgData = [
    {
      label: '技术部',
      value: 'tech',
      children: [
        {
          label: '研发中心',
          value: 'rd',
          children: [
            { label: '前端组', value: 'frontend-team' },
            { label: '后端组', value: 'backend-team' },
            { label: '测试组', value: 'qa-team' },
          ],
        },
        {
          label: '运维中心',
          value: 'ops',
          children: [
            { label: '系统组', value: 'system-team' },
            { label: '网络组', value: 'network-team' },
          ],
        },
      ],
    },
    {
      label: '产品部',
      value: 'product',
      children: [
        {
          label: '产品设计中心',
          value: 'design',
          children: [
            { label: 'UI设计组', value: 'ui-team' },
            { label: 'UX设计组', value: 'ux-team' },
          ],
        },
        {
          label: '产品规划中心',
          value: 'planning',
          children: [
            { label: '产品经理组', value: 'pm-team' },
            { label: '数据分析组', value: 'analysis-team' },
          ],
        },
      ],
    },
    {
      label: '市场部',
      value: 'marketing',
      children: [
        {
          label: '市场营销中心',
          value: 'marketing-center',
          children: [
            { label: '品牌组', value: 'brand-team' },
            { label: '推广组', value: 'promotion-team' },
          ],
        },
        {
          label: '销售中心',
          value: 'sales-center',
          children: [
            { label: '国内销售组', value: 'domestic-sales' },
            { label: '海外销售组', value: 'overseas-sales' },
          ],
        },
      ],
    },
  ]

  // 创建级联选择器配置
  const cascadeConfigs = reactive<CascadeConfig[]>([
    {
      id: 'city',
      title: '城市级联选择',
      data: cityData,
      selected: {},
      placeholders: ['请选择省份', '请选择城市', '请选择区县'],
      labels: {
        primary: '省份',
        secondary: '城市',
        tertiary: '区县',
      },
    },
    {
      id: 'tech',
      title: '技术分类选择',
      data: techData,
      selected: {},
      placeholders: ['请选择技术方向', '请选择技术框架', '请选择具体版本'],
      type: 'primary',
      labels: {
        primary: '方向',
        secondary: '框架',
        tertiary: '版本',
      },
    },
    {
      id: 'org',
      title: '部门组织选择',
      data: orgData,
      selected: {},
      placeholders: ['请选择中心', '请选择部门', '请选择小组'],
      labels: {
        primary: '中心',
        secondary: '部门',
        tertiary: '小组',
      },
    },
  ])

  // 通用重置方法
  const resetSelected = (config: CascadeConfig) => {
    config.selected = {}
  }

  // 通用变更处理方法
  const handleChange = (config: CascadeConfig, val: CascadeSelected) => {
    console.info(`${config.title}:`, {
      [config.labels.primary]: val.primary?.label,
      [config.labels.secondary]: val.secondary?.label,
      [config.labels.tertiary]: val.tertiary?.label,
    })
  }
</script>

<template>
  <div class="cascade-demo">
    <!-- 使用v-for循环渲染多个级联选择器 -->
    <div
      v-for="config in cascadeConfigs"
      :key="config.id"
      class="demo-section"
    >
      <h3>{{ config.title }}</h3>
      <C_Cascade
        :data="config.data"
        v-model="config.selected"
        :placeholders="config.placeholders"
        :type="config.type"
        @change="val => handleChange(config, val)"
      />
      <div class="mt-3">
        <NButton
          type="primary"
          @click="() => resetSelected(config)"
          >重置</NButton
        >
        <div class="mt-3">
          <h4>当前选择的{{ config.title.replace('选择', '') }}：</h4>
          <div v-if="config.selected.primary">
            {{ config.labels.primary }}: {{ config.selected.primary.label }}
          </div>
          <div v-if="config.selected.secondary">
            {{ config.labels.secondary }}: {{ config.selected.secondary.label }}
          </div>
          <div v-if="config.selected.tertiary">
            {{ config.labels.tertiary }}: {{ config.selected.tertiary.label }}
          </div>
          <pre v-if="!config.selected.primary">未选择</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .cascade-demo {
    padding: 20px;
  }

  .demo-section {
    margin-bottom: 40px;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
  }

  .demo-section h3 {
    margin-bottom: 20px;
    color: #2d8cf0;
  }

  .mt-3 {
    margin-top: 12px;
  }

  h4 {
    margin: 16px 0;
    color: #666;
  }
</style>
