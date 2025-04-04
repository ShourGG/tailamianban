<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-04 11:02:36
 * @FilePath: \bun_vite_uno_naive\README.md
 * @Description:
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

# bun_vite_uno_naive

关于项目介绍，使用bun作为运行时环境及包管理器，使用vite作为打包构建工具，使用uno原子化css增益，使用naiveUI框架。

## 项目启动

```sh
bun install
```

### Compile and Hot-Reload for Development

```sh
bun dev
```

### Type-Check, Compile and Minify for Production

```sh
bun run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
bun test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
bun lint
```

## 关于 vscode 插件使用

1. Vscode Samge Translate 插件

desc: 用于快速中英文翻译切换，并生成变量命名方式

use: Ctrl+Shift+P， 选择 Samge 进行对应功能使用

key: Alt+x 翻译成中文， Alt+z 翻译成英文

2. any-rule 插件

desc: 用于快速生成正则

use: 右键 => 正则大全

key: @zz 弹出正则选项,根据生成的选项,可以图解正则

3. Better Comments 插件

desc: 在js文件中,通过颜色标记区分注释评论描述

use: //\* 绿色 //! 红色 //? 蓝色

key: 注释修饰[* ! ? ]

4. code settings sync 插件

desc: 用于快速团队同步 vscode 插件及配置

use: [地址](https://marketplace.visualstudio.com/items?itemName=Alex-Chen.gitee-code-settings-sync)

5. Code Spell Checker 插件

desc: 用于快速检查代码和文档拼写是否正确

use: 将一些典型词，非语法错误的单词，报波浪提示后添加cspell.json，或通过灯泡添加

key: 拼写后单词上方提示的黄色小灯泡💡

6. CodeSnap 插件

desc: 用于快速生成代码截图

use: 右键 => 底部选项 CodeSnap

7. EmoJi 插件

desc: 用于快速选择表情符号

use: 输入 Ctrl+Shift+P => 输入 emo 行对应表情

key: F1 => emo

8. JSON to JS 插件

desc: 用于快速将json格式转换为js格式

use: 从剪切板，选择转换，可选引号 3种 方式进行转换

key: Shift + Ctrl + Alt + V | S 或 F1 => Clipboard

9. koroFileHeader 插件

desc: 用于添加头部注释，函数注释

use: 在文件头部使用快捷键，或自动识别生成，函数注释勾选使用快捷键生成

key: ctrl+win+i 头部注释 ctrl+win+t 函数注释

10. TODO Tree 插件

desc: 用于快速高亮代码中的 TODO 等标记性注释

use: 通过注释关键词的方式，高亮显示

key: TODO: 待完成 | BUG: 问题 | TAG: 标签 | FIXME: 待修复 | HACK: 自定义 | MARK: 标记

11. Turbo Console Log 插件

desc: 用于快速生成 console 打印信息

use: 通过选中变量，按下快捷键，生成打印句柄

key: ctrl+alt+l 生成 alt+shift+c 注释所有 +u 启用所有 +d 删除所有

## 关于 git 提交规范

> 参考约定式提交 [约定式提交规范](https://www.conventionalcommits.org/zh-hans/v1.0.0/)

### 安装相关依赖和增加相关配置

1. 需要全局安装 commitizen

```bash
bun add commitizen@4.2.4 -g
```

2. 使用 `git cz` 或 `cz` 代替 `git commit` 提交代码

这里我们强制需要按照 `commitlint` 来规范提交代码。


