# 拼图验证码组件 C_Captcha

一个基于 vue3-puzzle-vcode 封装的拼图验证码组件，界面简洁，使用方便。

## 安装

```bash
npm install vue3-puzzle-vcode
```

## 基本使用

```vue
<template>
  <C_Captcha
    @success="handleSuccess"
    @fail="handleFail"
  />
</template>

<script setup>
  import C_Captcha from '@/components/global/C_Captcha/index.vue'

  const handleSuccess = data => {
    console.log('验证成功：', data)
    // data: { token: string, timestamp: number }
  }

  const handleFail = error => {
    console.log('验证失败：', error)
  }
</script>
```

## 组件属性

| 属性          | 类型              | 默认值             | 说明                       |
| ------------- | ----------------- | ------------------ | -------------------------- |
| `triggerText` | string            | '点击进行人机验证' | 触发按钮的文字             |
| `images`      | string[]          | []                 | 自定义验证图片列表（可选） |
| `disabled`    | boolean           | false              | 是否禁用                   |
| `theme`       | 'light' \| 'dark' | 'dark'             | 主题色（暂未完全实现）     |

## 组件事件

| 事件名    | 参数                                   | 说明               |
| --------- | -------------------------------------- | ------------------ |
| `success` | `{ token: string, timestamp: number }` | 验证成功时触发     |
| `fail`    | `error: string`                        | 验证失败时触发     |
| `change`  | `valid: boolean`                       | 验证状态变化时触发 |
| `reset`   | -                                      | 重置验证时触发     |

## 组件方法

通过 ref 可以调用以下方法：

```vue
<template>
  <C_Captcha ref="captchaRef" />
  <button @click="checkValidation">检查验证状态</button>
</template>

<script setup>
  const captchaRef = ref()

  const checkValidation = () => {
    // 检查是否已验证
    const isValid = captchaRef.value.validate()

    // 获取验证令牌
    const token = captchaRef.value.getToken()

    // 获取完整验证数据
    const data = captchaRef.value.getVerificationData()

    // 重置验证状态
    captchaRef.value.reset()

    // 手动触发验证
    captchaRef.value.show()
  }
</script>
```

### 方法详情

- `validate()` - 返回当前是否已验证通过
- `getToken()` - 返回验证令牌字符串
- `getVerificationData()` - 返回完整验证数据对象或 null
- `reset()` - 重置验证状态
- `show()` - 手动显示验证弹窗

## 实际使用场景

### 登录表单验证

```vue
<template>
  <form @submit="handleLogin">
    <input
      v-model="username"
      placeholder="用户名"
    />
    <input
      v-model="password"
      type="password"
      placeholder="密码"
    />

    <C_Captcha
      ref="captchaRef"
      trigger-text="请完成安全验证"
      @success="onCaptchaSuccess"
    />

    <button
      type="submit"
      :disabled="!canSubmit"
      >登录</button
    >
  </form>
</template>

<script setup>
  const username = ref('')
  const password = ref('')
  const captchaRef = ref()
  const canSubmit = ref(false)

  const onCaptchaSuccess = () => {
    canSubmit.value = true
  }

  const handleLogin = e => {
    e.preventDefault()

    if (!captchaRef.value.validate()) {
      alert('请先完成验证')
      return
    }

    const captchaData = captchaRef.value.getVerificationData()

    // 提交登录数据
    login({
      username: username.value,
      password: password.value,
      captcha: captchaData,
    })
  }
</script>
```

### 重要操作二次确认

```vue
<template>
  <button @click="deleteItem">删除数据</button>

  <C_Captcha
    ref="captchaRef"
    trigger-text="确认删除操作"
    @success="confirmDelete"
  />
</template>

<script setup>
  const captchaRef = ref()

  const deleteItem = () => {
    // 显示验证码确认
    captchaRef.value.show()
  }

  const confirmDelete = () => {
    // 执行删除操作
    console.log('删除确认成功')
  }
</script>
```

## 注意事项

1. **依赖安装**：确保已安装 `vue3-puzzle-vcode` 依赖
2. **验证时机**：建议在关键操作前进行验证，如登录、支付、删除等
3. **令牌使用**：验证成功后的 token 应该在后端验证有效性
4. **重置机制**：验证失败会自动在 3 秒后清除错误状态
5. **移动端适配**：组件已做响应式处理，移动端正常使用

## 常见问题

**Q: 验证码图片可以自定义吗？**  
A: 可以，通过 `images` 属性传入图片 URL 数组即可。

**Q: 如何在表单提交前检查验证状态？**  
A: 使用 `captchaRef.value.validate()` 方法检查。

**Q: 验证成功后如何重新验证？**  
A: 点击右侧的刷新按钮，或调用 `reset()` 方法。

**Q: 组件支持哪些浏览器？**  
A: 支持所有现代浏览器，IE 不支持。

## 更新日志

- **v1.0.0** - 初始版本，基础拼图验证功能
