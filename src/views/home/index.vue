<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-06 14:09:47
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-16 21:57:36
 * @FilePath: \Robot_Admin\src\views\home\index.vue
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="home-container page-container">
    <!-- 页面标题和日期选择器 -->
    <NGrid
      :x-gap="12"
      style="margin: 15px"
    >
      <NGi
        :span="24"
        class="page-title-box"
      >
        <h4 class="page-title">Data Analysis</h4>
        <div class="page-title-right">
          <NButton
            type="error"
            size="small"
            @click="handleLogout"
            >模拟退出</NButton
          >
          <NDatePicker
            v-model:value="pickDate"
            type="date"
            placeholder="选择日期"
          />
        </div>
      </NGi>
    </NGrid>

    <!-- 数据卡片行 -->
    <NGrid :x-gap="12">
      <!-- 访问量卡片 -->
      <NGi :span="6">
        <NCard
          hoverable
          class="card"
        >
          <NGrid :x-gap="12">
            <NGi
              :span="12"
              style="text-align: left"
            >
              <h5 class="text-muted">Visit</h5>
              <h3 class="margin-top-1 margin-bottom-1">6,168</h3>
              <p class="text-muted">
                <span class="i-mdi:arrow-up-thin"></span>
                <span class="text-success margin-right-1"> 3.66% </span>
              </p>
            </NGi>
            <NGi
              :span="12"
              class="flex flex-column flex-end"
            >
              <div
                class="e-chart"
                style="height: 70px; width: 100%"
              >
                <div
                  ref="Refcampagin"
                  style="width: inherit; height: inherit; min-height: 70px"
                ></div>
              </div>
            </NGi>
          </NGrid>
        </NCard>
      </NGi>

      <!-- 新线索卡片 -->
      <NGi :span="6">
        <NCard
          hoverable
          class="card"
        >
          <NGrid :x-gap="12">
            <NGi
              :span="12"
              style="text-align: left"
            >
              <h5 class="text-muted">new Leads</h5>
              <h3 class="margin-top-1 margin-bottom-1">6,168</h3>
              <p class="text-muted">
                <span class="i-mdi:arrow-up-thin"></span>
                <span class="text-success margin-right-1"> 4.66% </span>
              </p>
            </NGi>
            <NGi
              :span="12"
              class="flex flex-column flex-end"
            >
              <div
                class="e-chart"
                style="height: 70px; width: 100%"
              >
                <div
                  ref="RefLeads"
                  style="width: inherit; height: inherit; min-height: 70px"
                ></div>
              </div>
            </NGi>
          </NGrid>
        </NCard>
      </NGi>

      <!-- 交易卡片 -->
      <NGi :span="6">
        <NCard
          hoverable
          class="card"
        >
          <NGrid :x-gap="12">
            <NGi
              :span="12"
              style="text-align: left"
            >
              <h5 class="text-muted">Deals</h5>
              <h3 class="margin-top-1 margin-bottom-1">6,168</h3>
              <p class="text-muted">
                <span class="i-mdi:arrow-up-thin"></span>
                <span class="text-danger margin-right-1"> 2.66% </span>
              </p>
            </NGi>
            <NGi
              :span="12"
              class="flex flex-column flex-end"
            >
              <div
                class="e-chart"
                style="height: 70px; width: 100%"
              >
                <div
                  ref="RefDeals"
                  style="width: inherit; height: inherit; min-height: 70px"
                ></div>
              </div>
            </NGi>
          </NGrid>
        </NCard>
      </NGi>

      <!-- 收入卡片 -->
      <NGi :span="6">
        <NCard
          hoverable
          class="card"
        >
          <NGrid :x-gap="12">
            <NGi
              :span="12"
              style="text-align: left"
            >
              <h5 class="text-muted">Booked Revenue</h5>
              <h3 class="margin-top-1 margin-bottom-1">6,168</h3>
              <p class="text-muted">
                <span class="i-mdi:arrow-up-thin"></span>
                <span class="text-success margin-right-1"> 5.66% </span>
              </p>
            </NGi>
            <NGi
              :span="12"
              class="flex flex-column flex-end"
            >
              <div
                class="e-chart"
                style="height: 70px; width: 100%"
              >
                <div
                  ref="RefRevenue"
                  style="width: inherit; height: inherit; min-height: 70px"
                ></div>
              </div>
            </NGi>
          </NGrid>
        </NCard>
      </NGi>
    </NGrid>

    <!-- 图表行 -->
    <NGrid :x-gap="12">
      <!-- 左侧饼图 -->
      <NGi :span="10">
        <NCard
          hoverable
          class="card"
        >
          <div class="header-title">
            <h4 class="text-muted">CAMPAIGNS</h4>
            <div class="dropdown">
              <span class="i-mdi:ellipsis-horizontal"></span>
            </div>
          </div>
          <div
            class="e-chart"
            style="height: 320px; width: 100%"
          >
            <div
              ref="RefPolorChart"
              style="width: inherit; height: inherit"
            ></div>
          </div>
          <NGrid :x-gap="12">
            <NGi
              v-for="(stat, index) in campaignStats"
              :key="index"
              :span="8"
            >
              <div class="icon-container">
                <i class="widget-icon bg-light-lighten rounded-circle">
                  <span :class="stat.icon"></span>
                </i>
              </div>
              <div style="margin-left: 40%">
                <h3 class="font-nomal margin-top-2 margin-bottom-1">{{
                  stat.value
                }}</h3>
                <p class="text-muted"
                  ><i :class="['icon', stat.iconClass]"></i> {{ stat.label }}</p
                >
              </div>
            </NGi>
          </NGrid>
        </NCard>
      </NGi>

      <!-- 右侧折线图 -->
      <NGi :span="14">
        <NCard
          hoverable
          class="card"
        >
          <div class="header-title">
            <h4 class="text-muted">Revenue</h4>
            <div class="dropdown">
              <span class="i-mdi:ellipsis-horizontal"></span>
            </div>
          </div>
          <div class="chart-bg padding-top-1 padding-bottom-1">
            <NGrid :x-gap="12">
              <NGi
                v-for="(week, index) in weekData"
                :key="index"
                :span="12"
              >
                <p class="text-muted text-muted-flag">{{ week.label }}</p>
                <h2 class="font-nomal text-center">
                  <small
                    :class="['text-primary', 'dot', week.dotClass]"
                  ></small>
                  <span>￥{{ week.value }}</span>
                </h2>
              </NGi>
            </NGrid>
          </div>
          <div
            class="e-chart"
            style="height: 361px"
          >
            <div
              ref="RefLineChart"
              style="width: inherit; height: inherit"
            ></div>
          </div>
        </NCard>
      </NGi>
    </NGrid>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { useInitBarChart } from './useInitBarChart'
  import { useInitGridChart } from './useInitLineChart'
  import { useInitPolorChart } from './useInitPolorChart'
  import { s_userStore } from '@/stores/user'

  // 引用
  const RefDeals = ref()
  const RefRevenue = ref()
  const Refcampagin = ref()
  const RefLeads = ref()
  const RefPolorChart = ref()
  const RefLineChart = ref()
  const pickDate = ref()

  // 活动统计数据
  const campaignStats = [
    {
      icon: 'i-mdi:location',
      value: '1620',
      label: 'Total',
      iconClass: 'total',
    },
    {
      icon: 'i-mdi:flag-variant',
      value: '3216',
      label: 'Reached',
      iconClass: 'reached',
    },
    {
      icon: 'i-mdi:folder-eye',
      value: '6329',
      label: 'Open',
      iconClass: 'open',
    },
  ]

  // 周数据
  const weekData = [
    {
      label: 'current week',
      value: '23.976',
      dotClass: 'bg-primary',
    },
    {
      label: 'previous week',
      value: '23.976',
      dotClass: 'bg-green',
    },
  ]

  const handleLogout = () => {
    s_userStore().logout()
  }

  // 初始化图表
  onMounted(() => {
    useInitBarChart(Refcampagin.value)
    useInitBarChart(RefLeads.value)
    useInitBarChart(RefRevenue.value)
    useInitBarChart(RefDeals.value)
    useInitPolorChart(RefPolorChart.value)
    useInitGridChart(RefLineChart.value)
  })
</script>

<style scoped lang="scss">
  .home-container {
    color: black;
    padding: 0px 20px;
    flex: 1;
    min-height: calc(100vh - var(--header-height));
    display: flex;
    flex-direction: column;
    .page-title-box {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      color: #6c757d;
      .page-title {
        font-size: 18px;
        margin: 0;
        line-height: 85px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: inherit;
        font-weight: 700;
      }
      .page-title-right {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
      }
    }
    :deep(.n-card) {
      margin-bottom: 30px;
      margin-right: 20px;
    }
    :deep(.n-card.bg-primary) {
      background-color: #46a0fc;
    }
    :deep(.text-white.n-icon-ellipsis) {
      color: white;
    }
    .flex {
      display: flex;
    }
    .flex-row {
      flex-direction: row;
    }
    .flex-column {
      flex-direction: column;
    }
    .flex-end {
      justify-content: flex-end;
    }
    .card {
      .padding-top-1 {
        padding-top: 10px;
      }
      .padding-bottom-1 {
        padding-bottom: 10px;
      }
      .margin-bottom-pro {
        margin-bottom: 15px;
      }
      .margin-right-1 {
        vertical-align: top;
        margin-right: 10px;
      }
      .margin-top-1 {
        margin-top: 10px;
      }
      .margin-top-2 {
        margin-top: 20px;
      }
      .margin-bottom-1 {
        margin-bottom: 10px;
      }
      .margin-bottom-2 {
        margin-bottom: 20px;
      }
      .font-nomal {
        font-weight: 400;
      }
      .text-muted {
        color: #98a6ad;
      }
      .text-muted-flag {
        margin-left: 40%;
      }
      .text-left {
        text-align: left;
      }
      .text-nowrap {
        white-space: nowrap;
      }
      .text-success {
        color: #0acf97;
      }
      .text-danger {
        color: #fa5c7c;
      }
      .text-primary {
        color: #409eff;
      }
      .text-light {
        color: #e3eaef;
      }
      .text-white {
        color: white;
      }
      .text-center {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
      .text-badge {
        margin-top: 20px;
        margin-bottom: 10px;
      }
      .font-13 {
        font-size: 13px;
      }
      .badge {
        display: inline-block;
        padding: 0.25em 0.4em;
        font-size: 75%;
        font-weight: 700;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: 0.25rem;
        transition:
          color 0.15s ease-in-out,
          background-color 0.15s ease-in-out,
          border-color 0.15s ease-in-out,
          box-shadow 0.15s ease-in-out;
      }
      .badge-danger {
        color: #fff;
        background-color: #fa5c7c;
      }
      .btn-link {
        font-weight: 400;
        color: #409eff;
        text-decoration: none;
        cursor: pointer;
      }
      .bg-primary {
        background-color: #409eff;
      }
      .bg-green {
        background-color: green;
      }
      .icon-square {
        width: 12px;
        height: 12px;
        display: inline-block;
      }
      .icon {
        width: 14px;
        height: 14px;
        display: inline-block;
        border-radius: 50%;
      }
      .total {
        background-color: #5572c3;
      }
      .reached {
        background-color: #93cb79;
      }
      .open {
        background-color: #f9c761;
      }
      .red {
        background-color: #ec6769;
      }
      .green {
        background-color: #93cb79;
      }
      .yellow {
        background-color: #f9c761;
      }
      .deep-blue {
        background-color: #5572c3;
      }
      .dot {
        width: 12px;
        height: 12px;
        display: inline-block;
        border-radius: 50%;
      }
      .chart-widget-list p {
        border-bottom: 1px solid #f1f3fa;
        margin-bottom: 0.5rem;
        padding-bottom: 0.5rem;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      .header-title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
        .dropdown {
          cursor: pointer;
        }
      }

      .card-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
      }
      .rounded-circle {
        border-radius: 50% !important;
      }
      .bg-light-lighten {
        background-color: rgba(227, 234, 239, 0.25) !important;
      }
      .icon-container {
        display: flex;
        justify-content: center;
      }
      .widget-icon {
        color: #248fed;
        font-size: 20px;
        background-color: #7fbdf33b;
        height: 40px;
        width: 40px;
        text-align: center;
        line-height: 40px;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .icon {
          width: 20px;
          height: 20px;
        }
      }
      .card-middle {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        color: #6c757d;
      }
      .card-footer {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }
      .e-chart {
        margin: auto;
        position: relative;
        width: 100%;
      }
    }
  }
</style>
