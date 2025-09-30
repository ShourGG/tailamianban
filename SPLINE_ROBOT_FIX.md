# 🤖 Spline 3D机器人头部跟随鼠标功能修复指南

## 📍 问题定位

**功能位置**：登录页面 (`web/src/views/login/index.vue`)  
**场景URL**：`https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`  
**依赖库**：`@splinetool/runtime@^1.9.92`

---

## 🔍 诊断步骤

### 1. 检查控制台日志

运行项目后，打开浏览器开发者工具（F12），查看控制台输出：

**正常情况应该看到**：
```
🤖 开始加载Spline场景: https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode
✅ Spline场景加载成功!
```

**如果看到错误**：
```
❌ Spline初始化失败: [错误信息]
请检查:
1. 网络连接是否正常
2. Spline场景URL是否可访问
3. @splinetool/runtime版本是否兼容
```

### 2. 检查鼠标移动事件

移动鼠标到3D场景区域，如果功能正常，应该看到：
```
🖱️ 鼠标移动事件: {...}
👁️ LookAt事件触发: {...}
🎯 Follow事件触发: {...}
```

---

## 🛠️ 修复方案

### 方案1：网络问题 - 使用CDN加速或本地化

**问题**：Spline场景URL在国内可能被墙或加载慢

**解决方法A - 使用代理**：
```bash
# 设置npm代理
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
```

**解决方法B - 下载场景到本地**：

1. 访问场景URL并下载：`https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`
2. 将文件放到 `web/public/` 目录
3. 修改 `web/src/views/login/index.vue`：

```vue
<!-- 修改前 -->
<Spline
  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
/>

<!-- 修改后 -->
<Spline
  scene="/scene.splinecode"
/>
```

### 方案2：更新依赖版本

```bash
# 进入web目录
cd web

# 更新到最新版本
npm install @splinetool/runtime@latest

# 或者指定稳定版本
npm install @splinetool/runtime@1.10.71
```

### 方案3：场景交互未配置

**问题**：Spline场景中可能没有配置"Look At"或"Follow"交互

**解决步骤**：

1. 访问 [Spline编辑器](https://app.spline.design/)
2. 创建或导入3D机器人模型
3. 选中机器人头部对象
4. 在右侧面板添加 **"Look At"** 交互：
   - 事件类型：Mouse Move（鼠标移动）
   - 目标：Camera 或 Mouse Position
   - 动作：Look At（看向）

5. 导出场景，获取新的场景URL
6. 替换代码中的场景URL

### 方案4：创建新的3D场景（推荐）

如果原场景失效，可以创建新场景：

```vue
<!-- web/src/views/login/index.vue -->
<template>
  <div class="login-container bg-[#181818]">
    <!-- ... -->
    
    <!-- 3D 机器人背景 -->
    <div class="spline-background">
      <Spline
        scene="YOUR_NEW_SCENE_URL_HERE"
        @spline-mouse-hover="handleMouseHover"
      />
    </div>
    
    <!-- ... -->
  </div>
</template>

<script setup lang="ts">
// 添加鼠标移动处理
const handleMouseHover = (e: any) => {
  console.log('鼠标移动到3D场景:', e)
  // 这里可以添加自定义交互逻辑
}
</script>
```

### 方案5：使用Three.js替代方案（纯代码实现）

如果Spline无法使用，可以用Three.js实现：

```bash
# 安装依赖
npm install three @types/three
```

创建 `web/src/views/login/components/ThreeRobot.vue`：

```vue
<template>
  <canvas ref="canvasRef" class="three-robot"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const canvasRef = ref<HTMLCanvasElement>()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let robot: THREE.Object3D
let mouseX = 0, mouseY = 0

onMounted(() => {
  if (!canvasRef.value) return

  // 初始化场景
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, alpha: true })
  
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.position.z = 5

  // 添加光源
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(0, 10, 10)
  scene.add(light)

  // 加载机器人模型
  const loader = new GLTFLoader()
  loader.load('/models/robot.glb', (gltf) => {
    robot = gltf.scene
    scene.add(robot)
  })

  // 鼠标移动事件
  window.addEventListener('mousemove', onMouseMove)
  
  // 动画循环
  animate()
})

function onMouseMove(event: MouseEvent) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1
}

function animate() {
  requestAnimationFrame(animate)
  
  if (robot) {
    // 机器人头部跟随鼠标
    robot.rotation.y = mouseX * 0.5
    robot.rotation.x = mouseY * 0.3
  }
  
  renderer.render(scene, camera)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<style scoped>
.three-robot {
  width: 100%;
  height: 100%;
}
</style>
```

---

## ✅ 验证修复

修复后，重新运行项目：

```bash
cd web
npm run dev
```

访问登录页面，检查：

1. ✅ 3D场景正常加载
2. ✅ 控制台无错误
3. ✅ 鼠标移动时，机器人头部跟随
4. ✅ 交互流畅，无卡顿

---

## 📝 常见问题

### Q1: 场景加载很慢怎么办？

**A**: 
- 使用方案1将场景本地化
- 或使用CDN加速
- 或切换到Three.js方案

### Q2: 机器人模型不显示？

**A**: 
- 检查场景URL是否正确
- 检查网络连接
- 查看控制台错误信息

### Q3: 头部跟随不灵敏？

**A**: 
- 在Spline中调整"Look At"的灵敏度
- 修改`eventHandler`的防抖时间（当前是50ms）

### Q4: 想要更换机器人模型？

**A**: 
1. 在Spline中创建新场景
2. 导入自己的3D模型
3. 配置交互效果
4. 获取新场景URL并替换

---

## 🔗 相关资源

- [Spline官方文档](https://docs.spline.design/)
- [Spline交互教程](https://www.bilibili.com/video/BV1Br1LYFEjf/)
- [@splinetool/runtime API](https://www.npmjs.com/package/@splinetool/runtime)
- [Three.js文档](https://threejs.org/docs/)

---

## 📞 需要帮助？

如果以上方案都无法解决问题，请：

1. 查看控制台完整错误信息
2. 检查网络请求（Network标签）
3. 提供详细的错误截图
4. 联系原作者或提Issue

**原项目仓库**：https://github.com/ChenyCHENYU/Robot_Admin
