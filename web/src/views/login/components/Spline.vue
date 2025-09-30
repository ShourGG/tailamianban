<template>
  <ParentSize
    :parent-size-styles="parentSizeStyles"
    :debounce-time="50"
    v-bind="$attrs"
  >
    <template #default>
      <canvas
        ref="canvasRef"
        :style="canvasStyle"
      />
      <slot v-if="isLoading" />
    </template>
  </ParentSize>
  <div class="login-logo"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
  import { Application, type SplineEventName } from '@splinetool/runtime'
  import { useDebounceFn, useIntersectionObserver } from '@vueuse/core'
  import ParentSize from './ParentSize.vue'

  // 添加日志过滤
  const originalConsole = console.log
  console.log = (...args) => {
    if (
      !args.some(
        arg => typeof arg === 'string' && arg.includes('updating from')
      )
    ) {
      originalConsole.apply(console, args)
    }
  }

  const props = defineProps({
    scene: {
      type: String,
      required: true,
    },
    onLoad: Function,
    renderOnDemand: {
      type: Boolean,
      default: true,
    },
    style: Object,
  })

  const emit = defineEmits([
    'error',
    'spline-mouse-down',
    'spline-mouse-up',
    'spline-mouse-hover',
    'spline-key-down',
    'spline-key-up',
    'spline-start',
    'spline-look-at',
    'spline-follow',
    'spline-scroll',
  ])

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const isLoading = ref(false)
  const splineApp = ref<Application | null>(null)
  const isVisible = ref(true)

  let cleanup: () => void = () => {}

  const parentSizeStyles = computed(() => ({
    overflow: 'hidden',
    ...props.style,
  }))

  const canvasStyle = computed(() => ({
    display: 'block',
    width: '100%',
    height: '100%',
  }))

  const { stop: stopIntersectionObserver } = useIntersectionObserver(
    canvasRef,
    ([{ isIntersecting }]) => {
      isVisible.value = isIntersecting
      if (isIntersecting && splineApp.value) {
        nextTick(() => {
          if (canvasRef.value && splineApp.value) {
            splineApp.value.requestRender()
            splineApp.value.setSize(
              canvasRef.value.clientWidth,
              canvasRef.value.clientHeight
            )
          }
        })
      }
    },
    { threshold: 0.1 }
  )

  function eventHandler(name: SplineEventName, handler?: (e: any) => void) {
    if (!handler || !splineApp.value) return
    const debouncedHandler = useDebounceFn(handler, 50, { maxWait: 100 })
    splineApp.value.addEventListener(name, debouncedHandler)
    return () => splineApp.value?.removeEventListener(name, debouncedHandler)
  }

  async function initSpline() {
    if (!canvasRef.value) return

    isLoading.value = true

    try {
      if (splineApp.value) {
        splineApp.value.dispose()
        splineApp.value = null
      }

      splineApp.value = new Application(canvasRef.value, {
        renderOnDemand: props.renderOnDemand,
      })

      const originalWarn = console.warn
      console.warn = (...args) => {
        if (
          args.some(
            arg => typeof arg === 'string' && arg.includes('updating from')
          )
        ) {
          console.log('Spline version compatibility notice:', ...args)
          return
        }
        originalWarn.apply(console, args)
      }

      console.log('🤖 开始加载Spline场景:', props.scene)
      await splineApp.value.load(props.scene)
      console.log('✅ Spline场景加载成功!')

      console.warn = originalWarn

      const cleanUpFns = [
        eventHandler('mouseDown', (e: any) => emit('spline-mouse-down', e)),
        eventHandler('mouseUp', (e: any) => emit('spline-mouse-up', e)),
        eventHandler('mouseHover', (e: any) => {
          console.log('🖱️ 鼠标移动事件:', e)
          emit('spline-mouse-hover', e)
        }),
        eventHandler('keyDown', (e: any) => emit('spline-key-down', e)),
        eventHandler('keyUp', (e: any) => emit('spline-key-up', e)),
        eventHandler('start', (e: any) => emit('spline-start', e)),
        eventHandler('lookAt', (e: any) => {
          console.log('👁️ LookAt事件触发:', e)
          emit('spline-look-at', e)
        }),
        eventHandler('follow', (e: any) => {
          console.log('🎯 Follow事件触发:', e)
          emit('spline-follow', e)
        }),
        eventHandler('scroll', (e: any) => emit('spline-scroll', e)),
      ].filter(Boolean)

      isLoading.value = false
      props.onLoad?.(splineApp.value)

      return () => {
        cleanUpFns.forEach(fn => fn?.())
      }
    } catch (err) {
      console.error('❌ Spline初始化失败:', err)
      console.error('请检查:')
      console.error('1. 网络连接是否正常')
      console.error('2. Spline场景URL是否可访问')
      console.error('3. @splinetool/runtime版本是否兼容')
      emit('error', err)
      isLoading.value = false
      return () => {}
    }
  }

  async function initialize() {
    cleanup()
    cleanup = (await initSpline()) ?? (() => {})
  }

  onMounted(async () => {
    await initialize()

    watch(isVisible, visible => {
      if (visible) {
        initialize()
      }
    })
  })

  onUnmounted(() => {
    stopIntersectionObserver()
    if (splineApp.value) {
      splineApp.value.dispose()
      splineApp.value = null
    }
  })
</script>
