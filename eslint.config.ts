/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-05 00:49:57
 * @FilePath: \bun_vite_uno_naive\eslint.config.ts
 * @Description: oxlint 和 eslint 配置文件，不要随便改，改了要同步干系人（注意）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'
import oxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  //MARK: 基础配置组
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  //MARK： 核心规则组（按优先级排序）

  ...oxlint.configs['flat/recommended'], // 高性能基础校验
  pluginVue.configs['flat/essential'], // Vue 专用规则
  vueTsConfigs.recommended, // TS 专用规则

  //MARK: 测试文件规则组
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  //MARK: 冲突解决和自定义规则组
  {
    rules: {
      // 关闭与 oxlint 重复的 ESLint 规则

      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Vue 组件规范

      //! 禁止在模板中注册但未使用的组件
      'vue/no-unused-components': 'error',

      // TypeScript 类型安全

      //! 警告禁止显式使用 any 类型（强制类型安全）
      '@typescript-eslint/no-explicit-any': 'warn',

      //! 限制 TypeScript 注释指令使用（必须带描述才能用 @ts-ignore）
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],

      // 代码可维护性

      //! 限制代码块的最大嵌套深度为4层，过深的嵌套难以理解和维护，如回调地狱
      'max-depth': ['error', 4],

      //! 函数复杂度阈值警告（超过 10 个逻辑分支时提示）
      'complexity': ['warn', 10],

      // 异步代码规范

      //! 禁止在循环中使用await，可能导致性能问题
      'no-await-in-loop': 'error',

      //MARK: 格式代码规范
      // "off" 或 0 - 关闭该规则
      // "warn" 或 1 - 启用并警告（不影响现有代码）
      // "error" 或 2 - 启用并报错（错误代码 1）

      'no-irregular-whitespace': 2, // 禁止不规则的空格
      'no-multi-spaces': 'error', // 禁止多个空格
      'space-infix-ops': 2, // 运算符前后禁止多个空格
      'array-bracket-spacing': ['error', 'never'], // 数组统一空格
      'arrow-spacing': ['error', { 'before': true, 'after': true }], // 箭头前后有空格
      'max-params': [1, 6], // 函数参数最大数量为 6
      'no-eval': 2, // 禁止使用 eval
      'prefer-const': 1, // 建议使用 const 声明不变的变量
      'no-var': 1, // 建议使用 let/const 替代 var
      'no-console': 1, // 禁止使用 c意味着提交代码的时候，删除或者禁用console
      'prefer-destructuring': [
        1,
        { object: true, array: false }, // 建议使用解构赋值
      ],
      'no-duplicate-imports': 2, // 禁止重复导入

      //MARK: 主动禁止 Vue 2 写法
      'vue/no-deprecated-props-default-this': 'error',
      'vue/no-deprecated-events-api': 'error',
      'vue/no-deprecated-filter': 'error',
      'vue/no-deprecated-functional-template': 'error',
    },
  },
  skipFormatting,
)
