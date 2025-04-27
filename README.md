<div align="center">
  <a href="https://robotadmin.cn">
    <picture>
      <source srcset="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" media="(prefers-color-scheme: dark)">
      <img src="https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/robot-left.png" />
    </picture>
  </a>
  <p>Robot Admin</p>
  <p>
    <a href="https://github.com/ChenyCHENYU/fearless/actions"><img src="https://img.shields.io/github/actions/workflow/status/ChenyCHENYU/fearless/main.yml" alt="Build Status"></a>
    <a href="https://github.com/ChenyCHENYU/fearless/blob/master/LICENSE"><img src="https://img.shields.io/github/license/ChenyCHENYU/fearless" alt="License"></a>
    <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen" alt="Code Style"></a>
  </p>
</div>

## 介绍

**Robot Admin** 是一个使用 `Bun1.x` + `Vite6.x` + `Vue3.x` + `Pinia3.x` + `Naive-ui2.x` + `Typescript5.x` + `Unocss66.x` 完整技术路线开发的项目，`Bun`夸张性能的毫秒级开发更新启动、新的`vue3 composition api` 结合 `script setup` + `jsx` 语法糖纵享丝滑般的开发体验、全新的 `pinia`状态管理器和优秀的设计体验（`1k`的 size）、使用漂亮及性能卓越的 UI 组件库 `naive`、安全高效的 `typescript`类型支持、代码规范验证、多级别的权限管理，提供开箱即用轻量级的中后台解决方案，希望通过聚焦业务场景，将基础组件封装成通用的业务组件，把通用的功能通过配置生成，可以尽量少的去写一些代码，更开发伙伴聚焦和关注实际的业务逻辑实现。

## 项目启动

:bell: 推荐使用 `bun` 进行依赖管理

这里我使用 `bun` 运行时替代了 `node` 运行时，同时将 `bun` 作为包管理工具，所以请先确定是否安装了 `bun` 。

```bash
npm install -g bun
```

启动项目先通过 `bun` 安装依赖，你会喜欢它的稳定和速度的，性能真的拉花活了。

```sh
bun install
```

### 编译和热重载开发

```sh
bun dev
```

### 为生产进行类型检查、编译和最小化

```sh
bun run build
```

### 运行单元测试[Vitest](https://vitest.dev/)

```sh
bun test:unit
```

## 推荐的 IDE 和配置

- [VSCode](https://code.visualstudio.com/) 后续我会把插件配置集放到 Gist，便于大家直接下载使用。

## 关于部分 vscode 插件使用

> 1.  Vscode Samge Translate 插件

- `desc：` 用于快速中英文翻译切换，并生成变量命名方式
- `cc` Ctrl+Shift+P， 选择 Samge 进行对应功能使用
- `key：` `Alt+x` 翻译成中文， `Alt+z` 翻译成英文

> 2. any-rule 插件

- `desc：` 用于快速生成正则
- `use：` 右键 => 正则大全
- `key：` `@zz` 弹出正则选项,根据生成的选项,可以图解正则

> 3. Better Comments 插件

- `desc：` 在js文件中,通过颜色标记区分注释评论描述
- `use：` //\* 绿色 //! 红色 //? 蓝色
- `key：` 注释修饰[* ! ? ]

> 4. code settings sync 插件

- `desc：` 用于快速团队同步 vscode 插件及配置
- `use：` [地址](https://marketplace.visualstudio.com/items?itemName=Alex-Chen.gitee-code-settings-sync)

> 5. Code Spell Checker 插件

- `desc：` 用于快速检查代码和文档拼写是否正确
- `use：` 将一些典型词，非语法错误的单词，报波浪提示后添加cspell.json，或通过灯泡添加
- `key：` 拼写后单词上方提示的黄色小灯泡💡

> 6. CodeSnap 插件

- `desc：` 用于快速生成代码截图
- `use：` 右键 => 底部选项 CodeSnap

> 7. EmoJi 插件

- `desc：` 用于快速选择表情符号
- `use：` 输入 `Ctrl+Shift+P` => 输入 `emo` 行对应表情
- `key：` `F1 => emo`

> 8. JSON to JS 插件

- `desc：` 用于快速将json格式转换为js格式
- `use：` 从剪切板，选择转换，可选引号 3种 方式进行转换
- `key：` `Shift + Ctrl + Alt + V | S` 或 `F1 => Clipboard`

> 9. koroFileHeader 插件

- `desc：` 用于添加头部注释，函数注释
- `use：` 在文件头部使用快捷键，或自动识别生成，函数注释勾选使用快捷键生成
- `key：` `ctrl+win+i` 头部注释 `ctrl+win+t` 函数注释

> 10. TODO Tree 插件

- `desc：` 用于快速高亮代码中的 TODO 等标记性注释
- `use：` 通过注释关键词的方式，高亮显示
- `key：` TODO: 待完成 | BUG: 问题 | TAG: 标签 | FIXME: 待修复 | HACK: 自定义 | MARK: 标记

> 11. Turbo Console Log 插件

- `desc：` 用于快速生成 console 打印信息
- `use：` 通过选中变量，按下快捷键，生成打印句柄
- `key：` `ctrl+alt+l` 生成 `alt+shift+c` 注释所有 **+u** 启用所有 **+d** 删除所有

## 特性

- 🔥 **最新技术栈**：使用 **vue3.x**、**vite6.x**、**pinia3.x** 等前端前沿技术开发
- ✨ **业务组件** 二次封装了多个常用的组件(详情候补...)
- 🍍 **状态管理器**：`vue3`新秀 **Pinia**，犹如 `react zustand`般的体验，友好的 api 和异步处理，官方推荐下一代的 `VueX`
- 🏆 **开发语言**：拥抱 **TypeScript5.x**，为团队协作更好的去赋能
- 🎉 **UI 组件**：`naive-ui`开发者无障碍使用 **jsx语法**，熟悉的配方熟悉的味道，当然，还有些许的情怀
- 🎨 **css 样式**：**scss** 、**unocss**、**postcss**
- 📖 **代码规范**：**Eslint**、**Prettier**、**Commitlint**
- 🔒 **权限管理**：页面级、菜单级、按钮级、接口级
- ✊ **依赖按需加载**：**unplugin-auto-import**，可自动导入使用到的`vue`、`vue-router`、`pinia`等依赖
- 💪 **组件按需导入**：**unplugin-vue-components**，无论是第三方 UI 组件还是自定义组件都可实现自动按需导入以及`TS`语法提示
- 🌟 **面向业务场景的组件封装** ：我觉得这是比较棒的一个点，更方便的大家低代码的使用，这一块会持续完善拓展，当然，如果有幸，可以 x 吸引你加入进来一起玩，那就更棒了

### 具体的版本指定

- 现代Vue js生态系统
  - `vue：` `3.5.13`
  - `pinia：` `3.0.1`
  - `vue-router：` `4.5.0`
- 完全强类型
  - `TypeScript：` `5.8.0`
- 下一代前端构建工具
  - `vite：` `6.2.1`
- 基于 `axios` API 的 HTTP 请求
  - or 0.x (not fetch)
- 可定制的UI库
  - `naive-ui：` `2.41.0`
- 完整的工程工作流程
  - `eslint：` `9.21.0`
  - `husky：` `7.0.1`
  - `lint-staged：` `15.5.0`
  - `commitlint：` `12.1.4`
- 本地模拟API服务器
  - `APIFOX` || `NestJS 10.x`
- 授权
  - 访问令牌
  - 刷新令牌
  - 验证刷新令牌
  - 基于角色授权
- 现代应用程序部署
  - `GitHub Actions`
  - `Vercel` (with Serverless functions)

## 前期准备和需要具备的能力

- [Node](http://nodejs.org/) 和 [git](https://git-scm.com/) -项目开发环境
- [Vite](https://vitejs.dev/) - 熟悉 `vite` 特性
- [Vue3](https://v3.vuejs.org/) - 熟悉 `Vue3` 基础语法
- [TypeScript](https://www.typescriptlang.org/) - 熟悉`TypeScript`基本语法
- [Es6+](http://es6.ruanyifeng.com/) - 熟悉 `es6` 基本语法
- [Vue-Router-Next](https://next.router.vuejs.org/) - 熟悉 vue-router 基本使用
- [Pinia](https://pinia.vuejs.org/) - 熟悉 `Pinia` 基本使用
- [Element-Plus](https://www.naiveui.com/zh-CN/light/) - `Ui` 框架的基本使用
- [Mock.js](https://github.com/nuysoft/Mock) - `Mockjs` 基本语法

## 项目目录

等构建完1.0版本后，候补吧...

## 项目预览图

![login](https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/robot-adminlogin.png)

![table](https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/robot-admintable.png)

更多界面请访问项目查看，[预览版](https://www.robotadmin.cn/) 这里老的版本，新版等待后续更新替换。

## 已完成功能 | The functionality is complete

- [x] Naive-Ui
- [x] N+1 多级菜单
- [x] Dashboard
- [x] 表格|超级表格
- [x] router Tab 选项卡
- [x] 表单
- [x] 图表 :antv or echart
- [x] 导入导出 Excel
- [x] 导出 Zip 文件
- [x] 拖拽组件
- [x] 富文本编辑器
- [x] markdown 编辑器
- [x] code JSON 编辑器
- [x] 个人页
- [x] 登录/注册页
- [x] 404 / 403 / 401
- [x] 菜单管理
- [x] 角色管理
- [x] 自定义图标
- [x] 拖拽组件
- [x] 支持切换主题色:一键换肤
- [x] 自定义指令
- [x] 国际化
- [x] 项目看板
- [x] ...未完待续

## 计划

- [ ] 完善主题功能集成
- [ ] 配置引入 `unocss`
- [ ] 集成 `nest` 服务
- [ ] 完善环境配置 `.env.development`/`.env.production`
- [ ] 面向业务场景组件的持续扩展，文档同步更新
- [ ] ... 还有更多畅想 ...

## 关于 git 提交规范

> 参考约定式提交 [约定式提交规范](https://www.conventionalcommits.org/zh-hans/v1.0.0/)

### 工程化 | Project Tool

- Git Hook 工具：[husky](https://typicode.github.io/husky/#/) + [lint-staged](https://github.com/okonet/lint-staged)
- 代码规范：[Prettier](https://prettier.io/) + [ESLint](https://eslint.org/)
- 提交规范：[Commitizen](http://commitizen.github.io/cz-cli/) + [Commitlint](https://commitlint.js.org/#/)
- 包管理器：[bun](https://bun.sh/)

### 安装相关依赖和增加相关配置

1. 需要全局安装 commitizen

```bash
bun add commitizen@4.2.4 -g
```

2. 使用 `git cz` 或 `cz` 代替 `git commit` 提交代码

🔔: 注意，如果安装在本地，不想在全局安装，本地安装的话，执行 `bun commit` 即可，或者配置 git alias，执行如下命令：

```bash
git config --global alias.cz '!bunx cz'
```

这里我们强制要求按照 `commitlint` 来规范提交代码。

### git 提交 | git commit

     git add *  // add everything

     git status  // check status

     git cz  // commit change

     git push // push stage commit

    // 如果 cz 命令无法找到，可以直接全局安装 commitizen 更省事儿

     npm install -g commitizen 或 bun add -g commitizen

> [!建议]🌦️
> 团队协同开发中，尽量不要随便修改配置文件相关的内容，修改前一定跟维护者达成一致。

## 关于环境信息

### 环境文件结构

- .env | # 全环境基础配置
- .env.development | # 开发环境
- .env.staging | # 预发布环境
- .env.test | # 测试环境
- .env.production | # 生产环境
- .env.local | # 本地覆盖配置（.gitignore） -

## 更新日志

后续完善...

## 项目地址

- [预览版](https://www.robotadmin.cn/) 这是老的 `ElementPlus` 版本，新版待更新。

- [Robot Admin](https://www.tzagileteam.com) - 项目文档

------ 下面是关于开源的版本要求 ------

## 🤝 如何贡献 | Contributing

期待优秀的您加入，或者获取到您宝贵的建议和经验，

**Pull Request:**

1. Fork 代码!
2. 创建自己的分支: `git checkout -b feat/xxxx`
3. 提交你的修改: `git commit -am 'feat(function): add xxxxx'`
4. 推送您的分支: `git push origin feat/xxxx`
5. 提交`pull request`

## Git 贡献提交规范

- 参考 [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) 规范 ([Angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular))

  - `wip` 开发中
  - `feat` 增加新功能
  - `fix` 修复问题/BUG
  - `style` 代码风格相关无影响运行结果的
  - `perf` 优化/性能提升
  - `refactor` 重构
  - `revert` 撤销修改
  - `test` 测试相关
  - `docs` 文档/注释
  - `chore` 依赖更新/脚手架配置修改等
  - `workflow` 工作流改进
  - `ci` 持续集成
  - `types` 类型定义文件更改

## 浏览器支持

推荐使用`webkit`内核浏览器

支持现代浏览器, 不支持 IE

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                                                             not support                                                                                              |                                                                                            last 2 versions                                                                                             |                                                                                                  last 2 versions                                                                                                  |                                                                                                last 2 versions                                                                                                |                                                                                                last 2 versions                                                                                                |

### ❓ 问题 | Issue

Contributions, issues and feature requests are welcome!.
<br />Feel free to check [issues page](https://github.com/chenyCHENYU/Robot-Admin/issues).

欢迎提 Issues

## 架构中使用的相关仓库

如果这些插件你认为不错并对你有帮助，可以给相关作者一个 star 支持下

- [vite-plugin-vue-setup-extend](https://github.com/vbenjs/vite-plugin-vue-setup-extend) - 扩展 setup 语法糖，但是更建议官方 `options`
- [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components) - 自动按需引入组件，替代手动封装的方式，性能更好
- [unplugin-icons](https://github.com/antfu/unplugin-icons) - 处理外部图标库图标的自动引入
- [vite-plugin-mock](https://github.com/anncwb/vite-plugin-mock) - 用于本地及开发环境数据 mock
- [vite-plugin-html](https://github.com/anncwb/vite-plugin-html) - 用于 html 模版转换及压缩
- [vite-plugin-theme](https://github.com/anncwb/vite-plugin-theme) - 用于在线切换主题色等颜色相关配置
- [vite-plugin-imagemin](https://github.com/anncwb/vite-plugin-imagemin) - 用于打包压缩图片资源
- [vite-plugin-compression](https://github.com/anncwb/vite-plugin-compression) - 用于打包输出.gz|.brotil 文件
- [vite-plugin-svg-icons](https://github.com/anncwb/vite-plugin-svg-icons) - 用于快速生成 svg 雪碧图

**Robot Admin** 是完全开源免费的项目，项目还在持续完善中，如果您觉得还不错，请 **Star、Fork、Watch** 一键三连 🎉🎉🎉，如果有好的想法和建议，欢迎您通过 [ycyplus@gmail.com](https://mail.google.com/mail) 跟我取得联系。
