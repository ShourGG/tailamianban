<template>
  <div class="dashboard">
    <!-- 头部区域 -->
    <NRow class="header">
      <NCol
        :span="24"
        class="title-box"
      >
        <h4 class="title">Dashboard</h4>
        <div class="actions">
          <NDatePicker
            v-model:value="pickDate"
            type="date"
            placeholder="选择日期"
          />
          <NButton
            circle
            type="primary"
            class="ml-3"
          >
            <template #icon><div class="i-uil:refresh"></div></template>
          </NButton>
          <NButton
            circle
            type="primary"
            class="ml-2"
          >
            <template #icon><div class="i-uil:search"></div></template>
          </NButton>
        </div>
      </NCol>
    </NRow>

    <!-- 信息卡片区域 -->
    <NRow :gutter="16">
      <!-- 左侧卡片区域 -->
      <NCol
        :span="10"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="10"
      >
        <NRow :gutter="16">
          <NCol
            v-for="(card, index) in infoCards"
            :key="index"
            :span="12"
            :xs="24"
            :sm="12"
          >
            <NCard
              hoverable
              class="info-card"
            >
              <div class="card-header">
                <h5 class="text-muted">{{ card.title }}</h5>
                <div class="widget-icon"><div :class="card.icon"></div></div>
              </div>
              <div class="card-middle"
                ><h3>{{ card.value }}</h3></div
              >
              <div class="card-footer">
                <div class="i-uil:arrow-up"></div>
                <span :class="card.trend > 0 ? 'text-success' : 'text-danger'"
                  >{{ Math.abs(card.trend) }}%</span
                >
                <span class="text-nowrap">since last week</span>
              </div>
            </NCard>
          </NCol>
        </NRow>
      </NCol>

      <!-- 右侧产品图表 -->
      <NCol
        :span="14"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="14"
      >
        <NCard
          hoverable
          class="chart-card product-chart"
        >
          <div class="card-header">
            <h4 class="text-muted">Products</h4>
            <div class="i-mdi:ellipsis-horizontal"></div>
          </div>
          <div
            class="chart-container no-padding"
            ref="refProduct"
          ></div>
        </NCard>
      </NCol>
    </NRow>

    <!-- 第二行图表区域 -->
    <NRow
      :gutter="16"
      class="mt-4"
    >
      <!-- 收入趋势图表 -->
      <NCol
        :span="16"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="16"
      >
        <NCard
          hoverable
          class="chart-card revenue-chart"
        >
          <div class="card-header">
            <h4 class="text-muted">Revenue</h4>
            <div class="i-mdi:ellipsis-horizontal"></div>
          </div>
          <div class="chart-legend">
            <NRow>
              <NCol
                :span="12"
                :xs="24"
                :md="12"
              >
                <p class="legend-label">Current week</p>
                <h2 class="legend-value">
                  <span class="dot primary"></span><span>￥23,976</span>
                </h2>
              </NCol>
              <NCol
                :span="12"
                :xs="24"
                :md="12"
              >
                <p class="legend-label">Previous week</p>
                <h2 class="legend-value">
                  <span class="dot green"></span><span>￥23,976</span>
                </h2>
              </NCol>
            </NRow>
          </div>
          <div
            class="chart-container"
            ref="refLineChart"
          ></div>
        </NCard>
      </NCol>

      <!-- 地区收入分布图 -->
      <NCol
        :span="8"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="8"
      >
        <NCard
          hoverable
          class="chart-card location-chart"
        >
          <div class="card-header">
            <h4 class="text-muted">Revenue by Location</h4>
            <div class="i-mdi:ellipsis-horizontal"></div>
          </div>
          <div
            class="chart-container"
            ref="refTreeMap"
          ></div>
          <div class="chart-footer">
            <h5 class="location">New York</h5>
            <NProgress
              :percentage="88"
              type="line"
              ><span>88k</span></NProgress
            >
          </div>
        </NCard>
      </NCol>
    </NRow>

    <!-- 第三行数据展示区域 -->
    <NRow
      :gutter="16"
      class="mt-4"
    >
      <!-- 销售数据表格 -->
      <NCol
        :span="12"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="12"
      >
        <NCard
          hoverable
          class="data-card bottom-card"
        >
          <div class="card-header with-action">
            <h4 class="text-muted">TOP SELLING PRODUCTS</h4>
            <div class="btn-link">
              <span>Export</span>
              <div class="i-uil:download-alt ml-1"></div>
            </div>
          </div>
          <NDataTable
            ref="tableRef"
            :data="tableData"
            :columns="columns"
            :pagination="false"
            :bordered="false"
          />
        </NCard>
      </NCol>

      <!-- 右侧统计区域 -->
      <NCol
        :span="12"
        :xs="24"
        :md="24"
        :lg="24"
        :xl="12"
      >
        <NRow :gutter="16">
          <!-- 销售饼图 -->
          <NCol
            :span="12"
            :xs="24"
            :md="12"
          >
            <NCard
              hoverable
              class="chart-card sales-chart bottom-card"
            >
              <div class="card-header">
                <h4 class="text-muted">TOTAL SALES</h4>
                <div class="i-mdi:ellipsis-horizontal"></div>
              </div>
              <div
                class="chart-container small"
                ref="refAverageSales"
              ></div>
              <div class="chart-legend-list">
                <div
                  v-for="(item, index) in salesData"
                  :key="index"
                  class="legend-item"
                >
                  <span
                    ><span :class="`color-box ${item.color}`"></span
                    >{{ item.name }}</span
                  >
                  <span>{{ item.value }}</span>
                </div>
              </div>
            </NCard>
          </NCol>

          <!-- 平均销售额和活动 -->
          <NCol
            :span="12"
            :xs="24"
            :md="12"
          >
            <NCard
              hoverable
              class="primary-card sale-size-card"
            >
              <div class="card-header">
                <h4 class="text-light">AVERAGE SALE SIZE</h4>
                <div class="i-mdi:ellipsis-horizontal text-light"></div>
              </div>
              <div class="avg-content">
                <div class="badge-container">
                  <span class="badge badge-danger">-23.47%</span>
                </div>
                <h3 class="value">￥156.37</h3>
                <p class="subtitle">Per sale</p>
                <NButton
                  type="primary"
                  ghost
                >
                  more
                  <template #icon
                    ><div class="i-uil:angle-right-b ml-1"></div
                  ></template>
                </NButton>
              </div>
            </NCard>

            <NCard
              hoverable
              class="chart-card mt-4 activity-card"
            >
              <div class="card-header">
                <h4 class="text-muted">RECENT ACTIVITY</h4>
                <div class="i-mdi:ellipsis-horizontal"></div>
              </div>
              <div class="timeline-container">
                <NTimeline>
                  <NTimelineItem
                    v-for="(activity, index) in activities"
                    :key="index"
                    :type="activity.type"
                    :color="activity.color"
                    :time="activity.timestamp"
                  >
                    {{ activity.content }}
                  </NTimelineItem>
                </NTimeline>
              </div>
            </NCard>
          </NCol>
        </NRow>
      </NCol>
    </NRow>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useInitChart } from './useInitEcharts'
  import { useInitLineChart } from './useInitLineCharts'
  import { useInitPieChart } from './useInitPieCharts'
  import { useInitTreeMap } from './useInitTreeMap'

  // 数据定义
  const pickDate = ref(null)
  const refProduct = ref<HTMLElement | null>(null)
  const refLineChart = ref<HTMLElement | null>(null)
  const refAverageSales = ref<HTMLElement | null>(null)
  const refTreeMap = ref<HTMLElement | null>(null)
  const tableRef = ref()

  const infoCards = [
    {
      title: 'Customers',
      value: '37,258',
      trend: 6.28,
      icon: 'i-mdi:cart',
    },
    {
      title: 'Orders',
      value: '3,258',
      trend: -2.28,
      icon: 'i-mdi:jewelry-box',
    },
    {
      title: 'Revenue',
      value: '￥3,258',
      trend: -3.28,
      icon: 'i-mdi:billboard',
    },
    {
      title: 'Growth',
      value: '+ 20.48%',
      trend: 5.28,
      icon: 'i-mdi:chart-line',
    },
  ]

  const salesData = [
    { name: 'Union Ads', value: '￥26,000', color: 'yellow' },
    { name: 'Direct', value: '￥26,000', color: 'green' },
    { name: 'Search Engine', value: '￥26,000', color: 'deep-blue' },
    { name: 'Video Ads', value: '￥26,000', color: 'red' },
  ]

  const tableData = [
    {
      date: '2016-05-02',
      name: 'cheny',
      province: '西安',
      city: '未央区',
      address: '西安市未央区太华南路888号',
      zip: 710000,
    },
    {
      date: '2016-05-02',
      name: 'cheny',
      province: '西安',
      city: '未央区',
      address: '西安市未央区太华南路888号',
      zip: 710000,
    },
    {
      date: '2016-05-02',
      name: 'cheny',
      province: '西安',
      city: '未央区',
      address: '西安市未央区太华南路888号',
      zip: 710000,
    },
    {
      date: '2016-05-02',
      name: 'cheny',
      province: '西安',
      city: '未央区',
      address: '西安市未央区太华南路888号',
      zip: 710000,
    },
    {
      date: '2016-05-02',
      name: 'cheny',
      province: '西安',
      city: '未央区',
      address: '西安市未央区太华南路888号',
      zip: 710000,
    },
  ]
  const activities = [
    {
      content: '支持使用图标',
      timestamp: '2018-04-12 20:46',
      type: 'info' as const,
      color: '#2080f0',
    },
    {
      content: '支持自定义颜色',
      timestamp: '2018-04-03 20:46',
      color: '#0bbd87',
    },
    {
      content: '支持自定义尺寸',
      timestamp: '2018-04-03 20:46',
      type: 'success' as const,
    },
    {
      content: '默认样式的节点',
      timestamp: '2018-04-03 20:46',
      type: 'default' as const,
    },
  ]

  // 表格列定义
  const columns = computed(() => [
    { title: '日期', key: 'date', width: 150, fixed: 'left' as const },
    { title: '姓名', key: 'name', width: 120 },
    { title: '省份', key: 'province', width: 120 },
    { title: '市区', key: 'city', width: 120 },
    { title: '地址', key: 'address', width: 400 },
    { title: '邮编', key: 'zip', width: 120 },
  ])

  onMounted(() => {
    useInitChart(refProduct.value!)
    useInitLineChart(refLineChart.value!)
    useInitPieChart(refAverageSales.value!)
    useInitTreeMap(refTreeMap.value!)
  })
</script>

<style lang="scss">
  // 变量定义
  $primary-color: #2080f0;
  $success-color: #0acf97;
  $danger-color: #fa5c7c;
  $muted-color: #98a6ad;
  $bg-color: #fafbfe;

  .dashboard {
    color: #333;
    padding: 20px;
    background-color: $bg-color;

    // 头部样式
    .header {
      margin-bottom: 20px;
    }

    .title-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #6c757d;

      .title {
        font-size: 18px;
        margin: 0;
        line-height: 60px;
        font-weight: 700;
      }

      .actions {
        display: flex;
        align-items: center;
      }
    }

    // 卡片通用样式
    .info-card,
    .chart-card,
    .data-card,
    .primary-card {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-shrink: 0;

        h4,
        h5 {
          color: $muted-color;
          margin: 0;
        }

        &.with-action {
          margin-bottom: 24px;
        }
      }
    }

    // 信息卡片样式
    .info-card {
      height: 170px; // 从170px减少到160px，与右侧产品图表更好对齐

      .card-header {
        .widget-icon {
          color: $primary-color;
          font-size: 18px;
          background-color: rgba(127, 189, 243, 0.23);
          height: 40px;
          width: 40px;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }

      .card-middle {
        flex: 1;
        display: flex;
        align-items: center;

        h3 {
          margin: 0;
          color: #6c757d;
          font-size: 24px;
        }
      }

      .card-footer {
        display: flex;
        align-items: center;
        color: $muted-color;
        margin-top: auto;
        padding-top: 8px; // 从10px减少到8px

        .text-success,
        .text-danger {
          margin: 0 8px;
        }

        .text-success {
          color: $success-color;
        }

        .text-danger {
          color: $danger-color;
        }
      }
    }

    // 产品图表卡片
    .product-chart {
      height: 356px; // 从376px减少到356px，匹配左侧4个卡片的总高度 (160px * 2 + 16px间距 * 2)

      .chart-container {
        flex: 1;
        height: 270px; // 相应调整图表容器高度

        &.no-padding {
          padding-top: 0; // 去掉顶部padding
        }
      }
    }

    // 第二行卡片
    .revenue-chart {
      height: 400px;

      .chart-container {
        flex: 1;
        min-height: 260px;
      }
    }

    .location-chart {
      height: 400px; // 匹配左侧收入图表高度

      .chart-container {
        flex: 1;
        min-height: 230px;
        padding-top: 10px; // 增加图表顶部的间距
      }

      .chart-footer {
        margin-top: auto;
        padding-top: 10px;
      }
    }

    // 底部卡片统一高度
    .bottom-card {
      height: 400px; // 统一底部卡片高度
      overflow: hidden; // 防止内容溢出
    }

    // 图表卡片样式
    .chart-card {
      .chart-container {
        flex: 1;
        width: 100%;
        min-height: 200px;

        &.small {
          min-height: 150px;
          padding-top: 10px; // 增加图表顶部的间距
        }
      }

      .chart-legend {
        background-color: #f9f9fd;
        padding: 16px;
        border-radius: 4px;
        margin-bottom: 16px;

        .legend-label {
          color: $muted-color;
          text-align: center;
          margin-bottom: 8px;
        }

        .legend-value {
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 400;
          margin: 0;

          .dot {
            width: 12px;
            height: 12px;
            display: inline-block;
            border-radius: 50%;
            margin-right: 8px;

            &.primary {
              background-color: $primary-color;
            }
            &.green {
              background-color: green;
            }
          }
        }
      }

      .chart-footer {
        padding: 16px 0;

        .location {
          font-weight: 400;
          margin-bottom: 8px;
        }
      }

      .chart-legend-list {
        margin-top: 10px;
        padding: 0 10px;
        overflow-y: auto; // 如果内容过多可以滚动
        max-height: 150px; // 限制最大高度

        .legend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid #f1f3fa;

          .color-box {
            width: 12px;
            height: 12px;
            display: inline-block;
            margin-right: 8px;

            &.yellow {
              background-color: #f9c761;
            }
            &.green {
              background-color: #93cb79;
            }
            &.deep-blue {
              background-color: #5572c3;
            }
            &.red {
              background-color: #ec6769;
            }
          }
        }
      }
    }

    // 销售图表特殊调整
    .sales-chart {
      .chart-container.small {
        height: 160px; // 减小高度，为图例留出更多空间
      }
    }

    // 蓝色卡片样式
    .primary-card {
      background-color: #46a0fc;

      &.sale-size-card {
        height: 170px; // 调整高度
      }

      .card-header h4 {
        color: rgba(255, 255, 255, 0.8);
      }

      .avg-content {
        text-align: center;
        padding: 8px 0; // 减小内边距
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .badge-container {
          margin: 8px 0; // 减小边距
        }

        .badge {
          display: inline-block;
          padding: 0.25em 0.4em;
          font-size: 75%;
          font-weight: 700;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          border-radius: 0.25rem;

          &.badge-danger {
            color: #fff;
            background-color: $danger-color;
          }
        }

        .value {
          color: white;
          font-weight: 400;
          margin: 8px 0; // 减小边距
        }

        .subtitle {
          color: #e3eaef;
          font-size: 13px;
          margin-bottom: 8px; // 减小边距
        }
      }
    }

    // 活动卡片
    .activity-card {
      height: 210px; // 增加高度，与销售卡片对齐

      .timeline-container {
        height: 130px; // 增加高度
        overflow: auto;
        padding: 0;
      }
    }

    // 数据表格样式
    .data-card {
      .btn-link {
        display: flex;
        align-items: center;
        color: $primary-color;
        cursor: pointer;
      }
    }

    // 辅助类
    .text-nowrap {
      white-space: nowrap;
    }
    .text-muted {
      color: $muted-color;
    }
    .text-light {
      color: rgba(255, 255, 255, 0.8);
    }
    .mt-4 {
      margin-top: 16px;
    }
    .ml-1 {
      margin-left: 4px;
    }
    .ml-2 {
      margin-left: 8px;
    }
    .ml-3 {
      margin-left: 12px;
    }
  }
</style>
