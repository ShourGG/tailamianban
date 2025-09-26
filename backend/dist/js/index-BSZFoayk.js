import Ce from"./index-BhsUH614.js";import{aA as we,aG as ke,aO as be,L as xe,a0 as Te,U as Se,S as Ve,P as Ne,ai as Ue,ae as Me,R as Fe,ag as $e,aX as Ae,ah as De,af as Ee,H as Le,a1 as Re,ao as Be}from"./ui-vendor-lRdd6BJd.js";import{k as We,r as m,e as z,o as Ie,Q as $,R as y,S as t,U as a,j as o,V as u,a3 as N,K as n,_ as U,Y as x,$ as r,F as ze,N as Pe}from"./vue-vendor-Bom1XEVO.js";import{_ as je}from"./_plugin-vue_export-helper-DlAUqK2U.js";const He=`# 欢迎使用 Markdown 编辑器

## 🚀 功能特性

- ✅ **实时预览**: 支持编辑与预览同步滚动
- ✅ **语法高亮**: 代码块语法高亮显示
- ✅ **图片上传**: 支持拖拽和粘贴上传图片
- ✅ **自动保存**: 可配置自动保存功能
- ✅ **字数统计**: 实时显示字数统计
- ✅ **全屏编辑**: 支持全屏编辑模式

## 📝 语法示例

### 代码块
\`\`\`javascript
function hello() {
  console.log('Hello, Markdown!');
}
\`\`\`

### 表格
| 功能 | 描述 | 状态 |
|-----|------|------|
| 编辑 | Markdown 编辑 | ✅ |
| 预览 | 实时预览 | ✅ |
| 保存 | 自动保存 | ✅ |

### 列表
1. 有序列表项 1
2. 有序列表项 2
   - 无序子列表
   - 另一个子列表

> **提示**: 这是一个引用块，可以用来突出重要信息。

**粗体文本** 和 *斜体文本*

[链接示例](https://github.com)
`,qe={title:{required:!0,message:"请输入文章标题",trigger:"blur"},summary:{required:!0,message:"请输入文章摘要",trigger:"blur"},category:{required:!0,message:"请选择文章分类",trigger:"change"},content:{required:!0,message:"请输入文章内容",trigger:"blur"}},O=[{label:"技术分享",value:"tech"},{label:"生活随笔",value:"life"},{label:"项目总结",value:"project"},{label:"学习笔记",value:"notes"}],Oe={edit:`# 编辑模式

这是编辑模式，支持编辑和预览切换。`,editable:`# 可编辑模式

这是可编辑模式，实时渲染 Markdown。`,preview:`# 预览模式

这是预览模式，**只能查看**，不能编辑。`},Ye={disabled:!1,autofocus:!1,defaultFullscreen:!1,autoSave:!1,height:400},Je=`# 配置演示

请在左侧调整配置选项，观察编辑器的变化。

## TOC 导航

### 小标题 1

### 小标题 2

### 小标题 3`,Ge=`
## 新增内容

### 代码示例
\`\`\`javascript
console.log('Hello World!');
\`\`\`

### 任务列表
- [x] 已完成的任务
- [ ] 待完成的任务
`,Ke=[{id:1,title:"Vue 3 组件设计最佳实践",author:"ChenYu",createTime:"2025-06-15 10:30:00",updateTime:"2025-06-20 14:20:00",content:`# Vue 3 组件设计最佳实践

## 前言

在 Vue 3 开发中，良好的组件设计是项目成功的关键。本文将分享一些实用的组件设计原则和最佳实践。

## 1. 组件职责单一

每个组件应该只负责一个明确的功能，避免组件过于复杂。

\`\`\`vue
<template>
  <div class="user-card">
    <img :src="user.avatar" :alt="user.name" />
    <h3>{{ user.name }}</h3>
    <p>{{ user.title }}</p>
  </div>
</template>
\`\`\`

## 2. Props 设计原则

- 明确的类型定义
- 合理的默认值
- 清晰的命名

## 3. 事件处理

使用 \`defineEmits\` 明确定义组件事件。

## 总结

良好的组件设计能够提高代码的可维护性和复用性。`},{id:2,title:"TypeScript 在前端项目中的应用",author:"ChenYu",createTime:"2025-06-10 09:15:00",updateTime:"2025-06-18 16:45:00",content:`# TypeScript 在前端项目中的应用

## 为什么选择 TypeScript?

TypeScript 为 JavaScript 添加了类型系统，能够在开发阶段发现潜在的错误。

## 基础类型

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

const user: User = {
  id: 1,
  name: 'John Doe'
};
\`\`\`

## 泛型的使用

泛型是 TypeScript 的强大特性之一。

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}
\`\`\`

## 在 Vue 项目中的应用

结合 Vue 3 的 Composition API，TypeScript 能够提供更好的开发体验。`},{id:3,title:"Markdown 编辑器的实现思路",author:"ChenYu",createTime:"2025-06-08 15:20:00",updateTime:"2025-06-19 11:30:00",content:`# Markdown 编辑器的实现思路

## 核心功能

一个完整的 Markdown 编辑器需要具备以下功能：

1. **语法解析**: 将 Markdown 语法转换为 HTML
2. **实时预览**: 编辑时实时显示渲染效果
3. **语法高亮**: 在编辑区域高亮显示语法
4. **工具栏**: 提供常用的格式化按钮

## 技术选型

- **解析器**: markdown-it
- **高亮**: highlight.js
- **编辑器**: CodeMirror 或自定义

## 实现细节

### 1. 基础结构

\`\`\`vue
<template>
  <div class="markdown-editor">
    <div class="editor-panel">
      <textarea v-model="content" />
    </div>
    <div class="preview-panel">
      <div v-html="htmlContent" />
    </div>
  </div>
</template>
\`\`\`

### 2. 实时渲染

使用 \`watch\` 监听内容变化，实时更新预览。

## 总结

构建一个功能完整的 Markdown 编辑器需要考虑用户体验、性能优化等多个方面。`}],Qe={class:"markdown-demo-page"},Xe={class:"editor-info"},Ze={class:"form-markdown-wrapper"},et={class:"form-word-count"},tt={key:0,class:"echo-info"},nt={class:"article-preview"},at={class:"article-meta"},lt={class:"create-time"},ot={key:0,class:"article-summary"},st={class:"article-content"},ut=We({__name:"index",setup(dt){const p=we(),P=ke(),A=m("basic"),T=m(He),Y=m(),j=m(0),D=m(""),E=m(""),H=m(),L=m(!1),R=m(!1),C=m(0),s=z({title:"",summary:"",category:"",tags:[],content:""}),w=z({...Oe}),c=z({...Ye}),B=m(Je),S=m(""),M=m(0),v=m(null),F=m(!1);Ie(()=>{});const J=(d,e)=>{},G=(d,e)=>{D.value=new Date().toLocaleString(),p.success("内容已保存!")},K=(d,e,k)=>{Array.from(k).forEach(f=>{const g=new FileReader;g.onload=i=>{e({url:i.target?.result,desc:f.name,width:"auto",height:"auto"})},g.readAsDataURL(f)}),p.success(`上传 ${k.length} 张图片`)},Q=d=>{E.value=new Date().toLocaleString(),p.info("自动保存成功")},X=d=>{j.value=d},Z=d=>{C.value=d},ee=d=>{M.value=d},te=()=>{T.value+=Ge},ne=()=>{P.warning({title:"确认清空",content:"确定要清空所有内容吗？此操作不可恢复。",positiveText:"确认",negativeText:"取消",onPositiveClick:()=>{T.value="",p.success("内容已清空")}})},ae=(d,e)=>{},le=(d,e)=>{p.error(`内容长度超出限制！当前 ${d} 字符，最大 ${e} 字符`)},oe=async()=>{try{await H.value?.validate(),L.value=!0,setTimeout(()=>{L.value=!1,p.success("文章发布成功！")},2e3)}catch{p.error("请完善表单信息")}},se=async()=>{R.value=!0,setTimeout(()=>{R.value=!1,p.success("草稿保存成功！")},1e3)},ue=()=>{if(!s.content.trim()){p.warning("请先输入文章内容");return}F.value=!0},de=()=>{P.warning({title:"确认重置",content:"确定要重置表单吗？所有填写的内容将丢失。",positiveText:"确认",negativeText:"取消",onPositiveClick:()=>{Object.assign(s,{title:"",summary:"",category:"",tags:[],content:""}),C.value=0,p.success("表单已重置")}})},re=d=>{p.info(`${d?"进入":"退出"}全屏模式`)},ie=d=>{p.info("配置演示编辑器自动保存成功")},W=d=>{const e=Ke.find(k=>k.id===d);e&&(v.value=e,S.value=e.content,M.value=e.content.length,p.success(`已加载文章: ${e.title}`))},me=()=>{v.value=null,S.value="",M.value=0,p.success("内容已清空")},pe=(d,e)=>{v.value&&(v.value.updateTime=new Date().toLocaleString())};return(d,e)=>{const k=be,f=xe,g=Ne,i=Se,h=Ce,_=Ve,V=Te,q=Fe,b=Me,ce=$e,fe=Ae,ge=Ue,I=De,ve=Ee,_e=Le,ye=Re,he=Be;return y(),$("div",Qe,[t(k,null,{default:a(()=>[...e[20]||(e[20]=[o("Markdown编辑器组件场景示例",-1)])]),_:1}),t(f,{class:"demo-header"},{default:a(()=>[...e[21]||(e[21]=[u("p",null,"基于 Vue 的 v-md-editor 插件，封装了Markdown 编辑器，支持实时预览、语法高亮、图片上传等功能",-1)])]),_:1}),t(ye,{value:n(A),"onUpdate:value":e[18]||(e[18]=l=>N(A)?A.value=l:null),type:"segment",animated:""},{default:a(()=>[t(V,{name:"basic",tab:"🔧 基础用法"},{default:a(()=>[t(f,{title:"基础编辑器",class:"demo-card"},{"header-extra":a(()=>[t(i,null,{default:a(()=>[t(g,{onClick:te,type:"primary",size:"small"},{default:a(()=>[...e[22]||(e[22]=[o(" 插入模板 ",-1)])]),_:1}),t(g,{onClick:ne,type:"warning",size:"small"},{default:a(()=>[...e[23]||(e[23]=[o(" 清空内容 ",-1)])]),_:1})]),_:1})]),default:a(()=>[t(h,{ref_key:"basicEditorRef",ref:Y,modelValue:n(T),"onUpdate:modelValue":e[0]||(e[0]=l=>N(T)?T.value=l:null),height:"500px",placeholder:"请输入你的 Markdown 内容...","auto-save":!0,"auto-save-interval":1e4,onChange:J,onSave:G,onUploadImage:K,onAutoSave:Q,onWordCountChange:X},null,8,["modelValue"]),u("div",Xe,[t(i,null,{default:a(()=>[t(_,{bordered:!1,type:"info"},{default:a(()=>[o(" 字数: "+r(n(j)),1)]),_:1}),n(D)?(y(),U(_,{key:0,bordered:!1,type:"success"},{default:a(()=>[o(" 最后保存: "+r(n(D)),1)]),_:1})):x("",!0),n(E)?(y(),U(_,{key:1,bordered:!1,type:"warning"},{default:a(()=>[o(" 自动保存: "+r(n(E)),1)]),_:1})):x("",!0)]),_:1})])]),_:1})]),_:1}),t(V,{name:"form",tab:"📋 表单集成"},{default:a(()=>[t(f,{title:"文章编辑表单",class:"demo-card"},{default:a(()=>[t(ge,{ref_key:"formRef",ref:H,model:n(s),rules:n(qe),"label-placement":"top"},{default:a(()=>[t(b,{label:"文章标题",path:"title"},{default:a(()=>[t(q,{value:n(s).title,"onUpdate:value":e[1]||(e[1]=l=>n(s).title=l),placeholder:"请输入文章标题",maxlength:100,"show-count":""},null,8,["value"])]),_:1}),t(b,{label:"文章摘要",path:"summary"},{default:a(()=>[t(q,{value:n(s).summary,"onUpdate:value":e[2]||(e[2]=l=>n(s).summary=l),type:"textarea",placeholder:"请输入文章摘要",rows:3,maxlength:200,"show-count":""},null,8,["value"])]),_:1}),t(b,{label:"文章分类",path:"category"},{default:a(()=>[t(ce,{value:n(s).category,"onUpdate:value":e[3]||(e[3]=l=>n(s).category=l),placeholder:"请选择文章分类",options:n(O)},null,8,["value","options"])]),_:1}),t(b,{label:"文章标签",path:"tags"},{default:a(()=>[t(fe,{value:n(s).tags,"onUpdate:value":e[4]||(e[4]=l=>n(s).tags=l)},null,8,["value"])]),_:1}),t(b,{label:"文章内容",path:"content",class:"form-markdown-item"},{default:a(()=>[u("div",Ze,[t(h,{modelValue:n(s).content,"onUpdate:modelValue":e[5]||(e[5]=l=>n(s).content=l),height:"400px",placeholder:"请输入文章内容...","max-length":2e4,class:"form-markdown-editor",onChange:ae,onMaxLengthExceeded:le,onWordCountChange:Z},null,8,["modelValue"]),u("div",et,[t(i,null,{default:a(()=>[t(_,{bordered:!1,type:"info",size:"small"},{default:a(()=>[o(" 字数统计: "+r(n(C))+" / 20000 ",1)]),_:1}),t(_,{bordered:!1,type:n(C)>18e3?"warning":n(C)>19e3?"error":"success",size:"small"},{default:a(()=>[o(r(n(C)<=19e3?"字数正常":n(C)<=19500?"接近上限":"即将超出"),1)]),_:1},8,["type"])]),_:1})])])]),_:1}),t(b,null,{default:a(()=>[t(i,null,{default:a(()=>[t(g,{type:"primary",onClick:oe,loading:n(L)},{default:a(()=>[...e[24]||(e[24]=[o(" 发布文章 ",-1)])]),_:1},8,["loading"]),t(g,{onClick:se,loading:n(R)},{default:a(()=>[...e[25]||(e[25]=[o(" 保存草稿 ",-1)])]),_:1},8,["loading"]),t(g,{onClick:ue},{default:a(()=>[...e[26]||(e[26]=[o(" 预览文章 ",-1)])]),_:1}),t(g,{onClick:de},{default:a(()=>[...e[27]||(e[27]=[o(" 重置表单 ",-1)])]),_:1})]),_:1})]),_:1})]),_:1},8,["model","rules"])]),_:1})]),_:1}),t(V,{name:"modes",tab:"🎨 不同模式"},{default:a(()=>[t(i,{vertical:"",size:24},{default:a(()=>[t(f,{title:"编辑模式 (edit)",class:"demo-card"},{default:a(()=>[t(h,{modelValue:n(w).edit,"onUpdate:modelValue":e[6]||(e[6]=l=>n(w).edit=l),mode:"edit",height:"300px",placeholder:"编辑模式 - 可以编辑和预览"},null,8,["modelValue"])]),_:1}),t(f,{title:"可编辑模式 (editable)",class:"demo-card"},{default:a(()=>[t(h,{modelValue:n(w).editable,"onUpdate:modelValue":e[7]||(e[7]=l=>n(w).editable=l),mode:"editable",height:"300px",placeholder:"可编辑模式 - 实时渲染"},null,8,["modelValue"])]),_:1}),t(f,{title:"预览模式 (preview)",class:"demo-card"},{default:a(()=>[t(h,{modelValue:n(w).preview,"onUpdate:modelValue":e[8]||(e[8]=l=>n(w).preview=l),mode:"preview",height:"300px",placeholder:"预览模式 - 只读"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}),t(V,{name:"config",tab:"⚙️ 配置选项"},{default:a(()=>[t(i,{vertical:"",size:24},{default:a(()=>[t(f,{title:"配置面板",class:"demo-card"},{default:a(()=>[t(i,{vertical:""},{default:a(()=>[t(i,{align:"center"},{default:a(()=>[t(I,{checked:n(c).disabled,"onUpdate:checked":e[9]||(e[9]=l=>n(c).disabled=l)},{default:a(()=>[...e[28]||(e[28]=[o(" 禁用编辑器 ",-1)])]),_:1},8,["checked"]),t(I,{checked:n(c).autofocus,"onUpdate:checked":e[10]||(e[10]=l=>n(c).autofocus=l)},{default:a(()=>[...e[29]||(e[29]=[o(" 自动聚焦 ",-1)])]),_:1},8,["checked"]),t(I,{checked:n(c).autoSave,"onUpdate:checked":e[11]||(e[11]=l=>n(c).autoSave=l)},{default:a(()=>[...e[30]||(e[30]=[o(" 启用自动保存 ",-1)])]),_:1},8,["checked"]),t(ve,{vertical:""}),e[31]||(e[31]=u("span",null,"编辑器高度:",-1)),t(_e,{value:n(c).height,"onUpdate:value":e[12]||(e[12]=l=>n(c).height=l),min:200,max:800,step:50,style:{width:"200px"}},null,8,["value"]),u("span",null,r(n(c).height)+"px",1)]),_:1})]),_:1})]),_:1}),t(f,{title:"配置演示",class:"demo-card"},{default:a(()=>[t(h,{modelValue:n(B),"onUpdate:modelValue":e[13]||(e[13]=l=>N(B)?B.value=l:null),height:`${n(c).height}px`,mode:n(c).disabled?"preview":"editable",autofocus:n(c).autofocus,"default-fullscreen":n(c).defaultFullscreen,autoSave:n(c).autoSave,autoSaveInterval:5e3,placeholder:"根据左侧配置动态调整的编辑器",onFullscreenChange:re,onAutoSave:ie},null,8,["modelValue","height","mode","autofocus","default-fullscreen","autoSave"])]),_:1})]),_:1})]),_:1}),t(V,{name:"echo",tab:"🔄 数据回显"},{default:a(()=>[t(i,{vertical:"",size:24},{default:a(()=>[t(f,{title:"模拟数据源",class:"demo-card"},{default:a(()=>[t(i,null,{default:a(()=>[t(g,{onClick:e[14]||(e[14]=l=>W(1)),type:"primary"},{default:a(()=>[...e[32]||(e[32]=[o(" 加载文章 1 ",-1)])]),_:1}),t(g,{onClick:e[15]||(e[15]=l=>W(2)),type:"primary"},{default:a(()=>[...e[33]||(e[33]=[o(" 加载文章 2 ",-1)])]),_:1}),t(g,{onClick:e[16]||(e[16]=l=>W(3)),type:"primary"},{default:a(()=>[...e[34]||(e[34]=[o(" 加载文章 3 ",-1)])]),_:1}),t(g,{onClick:me,type:"warning"},{default:a(()=>[...e[35]||(e[35]=[o(" 清空内容 ",-1)])]),_:1})]),_:1})]),_:1}),t(f,{title:"数据回显编辑器",class:"demo-card"},{"header-extra":a(()=>[n(v)?(y(),U(i,{key:0},{default:a(()=>[t(_,{type:"info"},{default:a(()=>[o(r(n(v).title),1)]),_:1}),t(_,{type:"success"},{default:a(()=>[o(r(n(v).author),1)]),_:1})]),_:1})):x("",!0)]),default:a(()=>[t(h,{modelValue:n(S),"onUpdate:modelValue":e[17]||(e[17]=l=>N(S)?S.value=l:null),height:"400px",placeholder:"点击上方按钮加载不同的文章内容",onChange:pe,onWordCountChange:ee},null,8,["modelValue"]),n(v)?(y(),$("div",tt,[t(i,null,{default:a(()=>[u("span",null,[e[36]||(e[36]=u("strong",null,"创建时间:",-1)),o(" "+r(n(v).createTime),1)]),u("span",null,[e[37]||(e[37]=u("strong",null,"更新时间:",-1)),o(" "+r(n(v).updateTime),1)]),u("span",null,[e[38]||(e[38]=u("strong",null,"字数:",-1)),o(" "+r(n(M)),1)])]),_:1})])):x("",!0)]),_:1})]),_:1})]),_:1})]),_:1},8,["value"]),t(he,{show:n(F),"onUpdate:show":e[19]||(e[19]=l=>N(F)?F.value=l:null),preset:"card",style:{width:"90%","max-width":"1200px"}},{header:a(()=>[...e[39]||(e[39]=[u("span",null,"📖 文章预览",-1)])]),default:a(()=>[u("div",nt,[u("h1",null,r(n(s).title||"未命名文章"),1),u("div",at,[t(i,null,{default:a(()=>[n(s).category?(y(),U(_,{key:0,type:"primary"},{default:a(()=>[o(r(n(O).find(l=>l.value===n(s).category)?.label),1)]),_:1})):x("",!0),(y(!0),$(ze,null,Pe(n(s).tags,l=>(y(),U(_,{key:l,type:"info"},{default:a(()=>[o(r(l),1)]),_:2},1024))),128)),u("span",lt,r(new Date().toLocaleString()),1)]),_:1})]),n(s).summary?(y(),$("div",ot,[u("p",null,[e[40]||(e[40]=u("strong",null,"摘要:",-1)),o(" "+r(n(s).summary),1)])])):x("",!0),u("div",st,[t(h,{"model-value":n(s).content||"暂无内容",mode:"preview",height:"auto",disabled:!0},null,8,["model-value"])])])]),_:1},8,["show"])])}}}),ct=je(ut,[["__scopeId","data-v-0ee835f4"]]);export{ct as default};
