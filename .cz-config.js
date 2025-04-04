/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-03 16:28:40
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-03 20:02:39
 * @FilePath: \bun_vite_uno_naive\.cz-config.js
 * @Description: commitizen 中 cz-customizable 自定义配置文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
module.exports = {

  scopes: [],
  allowEmptyScopes: false,
  allowCustomScopes: true,


  //MARK: 可选类型
  types: [
    { value: 'wip', name: 'wip:      开发中' },
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'fix', name: 'fix:      bug修复' },
    { value: 'docs', name: 'docs:     文档变更' },
    { value: 'style', name: 'style:    代码格式|样式(不影响代码运行的变动)' },
    {
      value: 'refactor',
      name: 'refactor: 重构(既不是增加feature，也不是修复bug)',
    },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'test', name: 'test:     增加测试' },
    { value: 'chore', name: 'chore:    构建过程或辅助工具的变动' },
    { value: 'revert', name: 'revert:   回退' },
    { value: 'build', name: 'build:    打包' },
  ],


  //MARK: 消息步骤
  messages: {
    type: '请选择提交类型:',
    customScope: '请输入修改范围(必填，格式如：父模块/子模块):\n',
    subject: '请简要描述提交(必填，中文表述):',
    body: '请输入修改范围(必填，格式如：一级模块名称/二级模块名称):\n',
    footer: '请输入要关闭的issue(可选):',
    confirmCommit: 'CodeMaster要做检查，确认使用以上信息提交？(y/n/e/h)',
  },

  //MARK: 跳过问题
  skipQuestions: ['body', 'footer'],

  //MARK: subject文字长度默认是72
  subjectLimit: 72,
}


