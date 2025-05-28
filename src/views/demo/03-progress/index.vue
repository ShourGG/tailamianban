<template>
  <div class="progress-demo">
    <!-- 基础线性进度条 - 最常用的进度展示方式 -->
    <NCard class="demo-section">
      <template #header>
        <div class="section-header">
          <h3>基础进度条</h3>
          <p class="description">
            用于展示操作进度，如文件上传、数据加载等场景。支持动画效果，让进度展示更加生动。
            适用于需要明确显示进度百分比的线性任务。
          </p>
        </div>
      </template>
      <!-- 基础线性进度条，支持动画效果，适合文件上传、下载等场景 -->
      <C_Progress
        :percentage="60"
        :is-animation="true"
        :stroke-width="12"
      />
    </NCard>

    <!-- 单圆环进度条 - 紧凑型设计 -->
    <NCard class="demo-section">
      <template #header>
        <div class="section-header">
          <h3>圆形进度条</h3>
          <p class="description">
            适用于在限定空间内展示进度的场景，如任务完成度、项目进度等。圆形设计更加紧凑美观，
            适合在卡片、仪表板等空间受限的界面中使用。
          </p>
        </div>
      </template>
      <!-- 单圆环进度条，适合空间受限的场景，如卡片展示 -->
      <C_Progress
        type="circle"
        :percentage="75"
        color="#18a058"
        :stroke-width="10"
        :is-animation="true"
      />
    </NCard>

    <!-- 多圆环赛跑进度条 - 多任务并行展示 -->
    <NCard class="demo-section">
      <template #header>
        <div class="section-header">
          <h3>圈圈赛跑</h3>
          <p class="description">
            多圆环动态进度展示，适用于多任务并行处理、多维度数据加载等场景。动画效果增强用户体验，
            可以同时对比多个任务的完成情况。
          </p>
        </div>
      </template>
      <!-- 多圆环赛跑效果，适合多任务并行处理的场景展示 -->
      <C_Progress
        type="multiple-circle"
        :percentage="circlePercentages"
        :color="[
          'var(--primary-color)',
          'var(--success-color)',
          'var(--warning-color)',
        ]"
        :rail-style="[
          { stroke: 'var(--primary-color)', opacity: 0.2 },
          { stroke: 'var(--success-color)', opacity: 0.2 },
          { stroke: 'var(--warning-color)', opacity: 0.2 },
        ]"
      >
        <template #indicator>
          <div class="race-indicator">
            <div class="race-title">圈圈赛跑！</div>
            <div class="race-speeds">
              <span>🏃‍♂️ {{ circlePercentages[0] }}%</span>
              <span>🏃‍♀️ {{ circlePercentages[1] }}%</span>
              <span>🏃 {{ circlePercentages[2] }}%</span>
            </div>
          </div>
        </template>
      </C_Progress>
    </NCard>

    <!-- NaiveUI 原生多圆环进度条 - 简洁双环展示 -->
    <NCard class="demo-section">
      <template #header>
        <div class="section-header">
          <h3>双环进度条</h3>
          <p class="description">
            使用 NaiveUI
            原生组件的双环进度条，适用于需要同时展示两个相关指标的场景，
            如内存使用率与CPU使用率、完成任务与总任务等对比展示。
          </p>
        </div>
      </template>
      <!-- NaiveUI 原生双环进度条，适合展示两个相关联的进度指标 -->
      <NProgress
        style="width: 120px"
        type="multiple-circle"
        :stroke-width="10"
        :circle-gap="10"
        :percentage="multipleCirclePercentages"
        :color="[themeVars.infoColor, themeVars.successColor]"
        :rail-color="[
          changeColor(themeVars.infoColor, { alpha: 0.2 }),
          changeColor(themeVars.successColor, { alpha: 0.2 }),
        ]"
      />
    </NCard>

    <!-- 仪表盘进度条 - 监控类场景专用 -->
    <NCard class="demo-section">
      <template #header>
        <div class="section-header">
          <h3>仪表盘进度条</h3>
          <p class="description">
            仪表盘形式展示进度，适用于系统性能监控、资源使用率等场景。直观展示当前状态，
            类似汽车仪表盘的设计，适合监控类应用的数据展示。
          </p>
        </div>
      </template>
      <!-- 仪表盘样式进度条，适合系统监控、性能指标等场景 -->
      <C_Progress
        type="dashboard"
        :percentage="85"
        :gap-degree="90"
        status="success"
        :is-animation="true"
      />
    </NCard>
  </div>
</template>

<script lang="ts" setup>
  import { useThemeVars } from 'naive-ui'
  import { changeColor } from 'seemly'

  // 获取主题变量，用于设置进度条颜色
  const themeVars = useThemeVars()

  // 多圆环赛跑进度数组，模拟三个并行任务的进展
  const circlePercentages = ref([0, 0, 0])

  // NaiveUI 双环进度条数据，模拟两个相关指标
  const multipleCirclePercentages = ref([30, 60])

  // 定时器引用，用于清理动画
  let raceTimer: NodeJS.Timer | null = null
  let doubleTimer: NodeJS.Timer | null = null

  /**
   * 更新圈圈赛跑的进度百分比
   * 每个圆环以不同的随机速度增长，模拟真实的并行任务进展
   */
  const updateRacePercentages = () => {
    circlePercentages.value = circlePercentages.value.map(
      p => (p + Math.random() * 2 + 1) % 100 // 1-3的随机速度增长
    )
  }

  /**
   * 更新双环进度条的百分比
   * 两个环以不同速度变化，展示相关性指标
   */
  const updateDoublePercentages = () => {
    multipleCirclePercentages.value = multipleCirclePercentages.value.map(
      (p, index) => {
        // 第一个环变化稍快，第二个环变化稍慢
        const speed =
          index === 0 ? Math.random() * 1.5 + 0.5 : Math.random() * 1 + 0.3
        return (p + speed) % 100
      }
    )
  }

  // 组件挂载时启动动画定时器
  onMounted(() => {
    // 圈圈赛跑动画，更新频率较高
    raceTimer = setInterval(updateRacePercentages, 100)
    // 双环动画，更新频率适中
    doubleTimer = setInterval(updateDoublePercentages, 150)
  })

  // 组件卸载前清理定时器，避免内存泄漏
  onBeforeUnmount(() => {
    raceTimer && clearInterval(raceTimer)
    doubleTimer && clearInterval(doubleTimer)
  })
</script>

<style lang="scss" scoped>
  .progress-demo {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;

    .demo-section {
      .section-header {
        h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .description {
          margin: 0;
          color: var(--text-color-3);
          font-size: 14px;
          line-height: 1.6;
        }
      }

      // 卡片内容区域 - 进度条居中展示
      :deep(.n-card__content) {
        padding: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }
    }

    // 圈圈赛跑指示器样式
    .race-indicator {
      text-align: center;

      .race-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-color-1);
      }

      .race-speeds {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 14px;
        color: var(--text-color-2);

        span {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
      }
    }
  }
</style>
