# 🤖 Robot Admin 贡献指南

> **来啊，快活啊！一起搞事情啊！** 🎉  
> 欢迎各路英雄好汉加入 Robot Admin 的开发大军！

## 🎯 直接开搞

别废话，先把项目跑起来再说：

```bash
# 1. Fork + Clone（你懂的）
git clone https://github.com/你的用户名/robot_admin.git
cd robot_admin

# 2. 装依赖（推荐 Bun，真的很快）
bun install
# 如果你还在用 npm/yarn，那就：npm install

# 3. 启动项目（毫秒级启动，不骗人）
bun dev

# 4. 打开浏览器访问 http://localhost:3000
# 看到机器人就算成功了 🤖
```

## 🔥 想贡献点啥？

### 🐛 发现Bug了？

- 不要慌，先确认一下是不是真的Bug
- 去 [Issues](https://github.com/ChenyCHENYU/robot_admin/issues) 看看有没有人已经提过了
- 没有的话就新建一个，**记得把错误信息贴出来**
- 最好能提供复现步骤，不然我也没办法修啊 😅

### 💡 有好点子？

- 先在 [Discussions](https://github.com/ChenyCHENYU/robot_admin/discussions) 聊聊
- 确保这个功能真的有用，不是脑洞大开
- 如果大家都觉得不错，那就开搞！

### 📚 文档有问题？

- README 里有错别字？直接改！
- 代码注释不清楚？直接改！
- 想加点使用示例？直接改！

### 🎨 想加新功能？

看看这些方向：

- **新的演示页面**：比如新的图表类型、表单组件等
- **实用工具函数**：放在 `src/utils/` 下面
- **自定义指令**：现在有 7 个，可以再加几个实用的
- **主题优化**：让界面更好看
- **性能优化**：让项目跑得更快

## 🛠️ 开发规范（不要太较真）

### 代码风格

我们用了 ESLint + Prettier，所以：

```bash
# 检查代码风格
bun run lint

# 自动修复（大部分问题都能自动搞定）
bun run lint:fix

# 格式化代码
bun run format
```

### 提交规范

用 [Conventional Commits](https://www.conventionalcommits.org/)，但别太死板：

```bash
# 新功能
git commit -m "feat: 添加了一个很酷的组件"

# 修Bug
git commit -m "fix: 修复了某某页面的显示问题"

# 文档更新
git commit -m "docs: 更新了使用说明"

# 其他的随意，能看懂就行
git commit -m "chore: 更新依赖版本"
```

### 目录结构

```
src/
├── components/global/     # 全局组件（重要的放这里）
├── views/demo/           # 演示页面（新功能展示页面放这里）
├── utils/                # 工具函数（实用函数放这里）
├── directives/           # 自定义指令（新指令放这里）
└── stores/               # 状态管理（全局状态放这里）
```

## 📝 提交流程

### 简单改动（文档、小Bug修复）

```bash
# 1. 创建分支
git checkout -b fix/修复某某问题

# 2. 改代码
# ...编码中...

# 3. 提交
git add .
git commit -m "fix: 修复了某某问题"

# 4. 推送
git push origin fix/修复某某问题

# 5. 创建 PR
```

### 大功能开发

```bash
# 1. 先聊聊
# 在 Discussions 或 Issues 里讨论一下

# 2. 创建分支
git checkout -b feat/新功能名称

# 3. 开发
# 可以分多次提交，没关系

# 4. 测试
bun test  # 确保不会搞坏现有功能

# 5. 提交 PR
# 写清楚做了什么，为什么要这样做
```

## 🚨 注意事项

### 技术栈限制

- **前端框架**：Vue 3 + TypeScript（这个别改）
- **UI组件库**：Naive UI（统一用这个）
- **样式**：UnoCSS + Sass（别引入其他CSS框架）
- **构建工具**：Vite + Bun（性能杠杠的）

### 兼容性要求

- **浏览器**：Chrome/Firefox/Safari/Edge 最新两个版本
- **Node.js**：>= 18.0.0
- **不支持 IE**：拜拜了您嘞 👋

### 性能要求

- 新功能不能拖慢整体性能
- 图片要压缩，代码要优化
- 大的第三方库要按需引入

## 🎨 UI/UX 规范

### 设计原则

- **保持简洁**：界面不要太花哨
- **用户友好**：操作要符合直觉
- **响应式**：手机、平板、电脑都要能用
- **主题统一**：跟现有风格保持一致

### 组件规范

- 组件名用 `C_` 开头（比如 `C_MyComponent`）
- Props 要有 TypeScript 类型定义
- 要有基本的使用示例
- 复杂组件要写文档

### 演示页面规范

- 放在 `src/views/demo/` 下面
- 要有完整的功能展示
- 代码要有注释说明
- 最好能复制粘贴直接用

## 🧪 测试

### 手动测试

```bash
# 启动开发服务器
bun dev

# 测试你的功能
# 确保在不同浏览器下都正常
# 手机端也要看看
```

### 自动化测试

```bash
# 运行测试
bun test

# 如果你写了新的工具函数，最好加个测试
```

## 📦 发布流程

这个你不用担心，我来搞定：

1. 合并到 main 分支
2. 自动构建和部署
3. 更新在线演示
4. 发布到 npm（如果需要的话）

## 🙋‍♂️ 需要帮助？

### 遇到问题了？

1. **先看文档**：[在线文档](https://www.tzagileteam.com)（还在完善中）
2. **搜索 Issues**：可能别人遇到过同样问题
3. **提新 Issue**：描述清楚问题，最好有截图
4. **发邮件**：[ycyplus@gmail.com](mailto:ycyplus@gmail.com)

### 想要什么功能？

- 先在 [Discussions](https://github.com/ChenyCHENYU/robot_admin/discussions) 里聊聊
- 看看大家的反馈
- 如果可行就开搞

### 不知道从哪开始？

推荐几个简单的入门任务：

- 修复文档中的错别字
- 添加新的工具函数
- 优化现有组件的样式
- 写新的演示页面

## 🏆 贡献者福利

### 你能得到什么？

- **GitHub 贡献记录**：绿色小方块 +1
- **项目展示**：你的代码会被很多人使用
- **技术提升**：在实战中学习新技术
- **社区认可**：成为项目的核心贡献者

### 特别感谢

所有贡献者都会在 README 中展示，感谢每一份贡献！

## 💬 项目发展方向

### 近期计划（看时间）

- [ ] 完善在线文档
- [ ] 添加更多演示页面
- [ ] 优化移动端体验
- [ ] 国际化支持

### 长期规划（画大饼）

- [ ] 独立的组件库
- [ ] 脚手架工具
- [ ] 移动端版本
- [ ] 后端服务

想参与哪个方向都欢迎！

## 🤝 行为准则

### 做个好人

- **友善交流**：大家都是为了让项目更好
- **耐心回答**：新手问题也要认真对待
- **建设性反馈**：批评要有建议，不要只吐槽
- **尊重差异**：技术实现可以讨论，但别人身攻击

### 不要做的事

- 发布垃圾信息
- 恶意破坏代码
- 抄袭他人工作
- 违法违规内容

## 📞 联系方式

**作者**：CHENY（就是我）

- **邮箱**：[ycyplus@gmail.com](mailto:ycyplus@gmail.com)
- **GitHub**：[@ChenyCHENYU](https://github.com/ChenyCHENYU)

**项目地址**：

- **在线预览**：[https://www.robotadmin.cn](https://www.robotadmin.cn)
- **GitHub**：[https://github.com/ChenyCHENYU/robot_admin](https://github.com/ChenyCHENYU/robot_admin)

---

## 🎉 最后的话

Robot Admin 不是什么高大上的项目，就是想做一个**真正好用**的后台管理系统模板。

如果你觉得这个项目还不错，**给个 Star ⭐ 呗**！

如果你想让它变得更好，**来贡献代码吧**！

如果你发现了问题，**告诉我一声**！

**一起搞事情，让开发变得更有趣！** 🚀

---

<div align="center">
  <strong>Made with ❤️ by Robot Admin Community</strong><br>
  <em>开源让世界更美好</em>
</div>
