<template>
  <NDropdown
    size="small"
    trigger="hover"
    :options="languageOptions"
    :value="currentLanguage"
    @select="handleLanguageChange"
  >
    <NButton text>
      <div class="flex items-center">
        <span class="i-mdi:language"></span>
      </div>
    </NButton>
  </NDropdown>
</template>

<script setup lang="ts">
  defineOptions({ name: 'C_Language' })

  const languageOptions = [
    {
      key: 'zh-CN',
      label: '简体中文',
      icon: () => h('span', { class: 'i-mdi:alpha-c' }),
    },
    {
      key: 'en-US',
      label: 'English',
      icon: () => h('span', { class: 'i-mdi:alpha-u' }),
    },
  ]

  const currentLanguage = ref('zh-CN')

  const handleLanguageChange = (key: string) => {
    currentLanguage.value = key
    // 这里添加您的语言切换逻辑
    console.info('切换语言到:', key)
  }
</script>
