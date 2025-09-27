import U from"./index-DvhOqMJr.js";import{r as i,e as P,k as R,aM as $,Q as T,R as _,S as t,U as l,j as a,V as s,l as f,_ as p,K as e,$ as m,Y as z,F as V,N as G}from"./vue-vendor-Bom1XEVO.js";import{aO as O,X as H,U as X,L as j,P as K,as as W,af as J,I as Q,V as q,S as Z,a1 as ee,a0 as le,ai as te,ae as ne,R as ae,Y as oe}from"./ui-vendor-lRdd6BJd.js";import{_ as ue}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-CkMMG6vV.js";import"./spline-vendor-Cs6wJgUK.js";import"./charts-vendor-CvHUaZlk.js";import"./editor-vendor-D83MfH0r.js";const w="<\/script>",ie={basic:`<!-- 指定延迟时间 -->
<NButton v-debounce="300" @click="handleClick">
  防抖按钮 (300ms)
</NButton>

<!-- 使用默认配置 -->
<NButton v-debounce @click="handleClick">
  默认防抖按钮
</NButton>

<!-- 普通按钮对比 -->
<NButton @click="handleClick">
  普通按钮 (无防抖)
</NButton>`,config:`<!-- 自定义延迟时间 -->
<NButton v-debounce="{
  delay: 1000,
  onExecute: handleExecute
}" @click="handleClick">
  慢速防抖 (1000ms)
</NButton>

<!-- 立即执行模式 -->
<NButton v-debounce="{
  delay: 500,
  immediate: true
}" @click="handleClick">
  立即执行防抖
</NButton>

<!-- 回调函数演示 -->
<NButton v-debounce="{
  delay: 800,
  onExecute: handleExecute,
  onCancel: handleCancel
}" @click="handleClick">
  回调演示按钮
</NButton>`,callback:`<script setup>
// 回调函数
const handleExecute = () => {
  console.log('防抖执行')
}

const handleCancel = () => {
  console.log('防抖取消')
}
${w}

<!-- 回调函数演示 -->
<NButton v-debounce="{
  delay: 500,
  onExecute: handleExecute,
  onCancel: handleCancel
}" @click="handleClick">
  回调演示按钮
</NButton>`,dynamic:`<script setup>
const debounceEnabled = ref(true)
const debounceDelay = ref(500)
const immediateMode = ref(false)

const handleExecute = () => {
  console.log('防抖执行')
}

const handleCancel = () => {
  console.log('防抖取消')
}
${w}

<!-- 动态配置 -->
<template>
  <NSpace>
    <NSwitch v-model:value="debounceEnabled" />
    <NText>启用防抖</NText>
    
    <NInputNumber v-model:value="debounceDelay" :min="100" :max="3000" />
    <NText>延迟时间(ms)</NText>

    <NSwitch v-model:value="immediateMode" />
    <NText>立即执行</NText>
  </NSpace>
  
  <NButton v-debounce="{
    disabled: !debounceEnabled,
    delay: debounceDelay,
    immediate: immediateMode,
    onExecute: handleExecute,
    onCancel: handleCancel
  }" @click="handleClick">
    动态配置防抖
  </NButton>
</template>`,scenarios:`<!-- 1. 表单提交防重复 -->
<NButton 
  v-debounce="{
    delay: 1000,
    onExecute: () => console.log('提交执行')
  }"
  type="primary"
  @click="handleSubmit"
  :loading="isSubmitting"
>
  提交表单 (防重复提交)
</NButton>

<!-- 2. 删除操作防误触 -->
<NButton 
  v-debounce="800"
  type="error"
  @click="handleDelete"
>
  删除数据 (防误删)
</NButton>

<!-- 3. 保存操作防抖 -->
<NButton 
  v-debounce="{
    delay: 600,
    onExecute: () => message.success('保存成功')
  }"
  type="warning"
  @click="handleSave"
>
  保存数据 (防抖保存)
</NButton>

<!-- 4. API调用防抖 -->
<NButton 
  v-debounce="{
    delay: 1000,
    immediate: false,
    onExecute: handleApiExecute
  }"
  @click="handleApiCall"
>
  调用API (防重复请求)
</NButton>`};function de(){return{activeTab:i("basic"),scenarioTab:i("submit"),basicClickCount:i(0),defaultClickCount:i(0),normalClickCount:i(0),slowClickCount:i(0),immediateClickCount:i(0),callbackExecuteCount:i(0),callbackCancelCount:i(0),debounceEnabled:i(!0),debounceDelay:i(500),immediateMode:i(!1),dynamicExecuteCount:i(0),dynamicCancelCount:i(0),formData:i({username:"",email:""}),formSubmitCount:i(0),isSubmitting:i(!1),submitSuccess:i(!1),deleteCount:i(0),saveCount:i(0),refreshCount:i(0)}}function ce(u){return{handleBasicClick:()=>u.basicClickCount.value++,handleDefaultClick:()=>u.defaultClickCount.value++,handleNormalClick:()=>u.normalClickCount.value++,handleSlowClick:()=>{u.slowClickCount.value++},handleSlowExecute:()=>{},handleImmediateClick:()=>{u.immediateClickCount.value++},handleImmediateExecute:()=>{},handleCallbackClick:()=>{},handleExecuteCallback:()=>{u.callbackExecuteCount.value++},handleCancelCallback:()=>{u.callbackCancelCount.value++},handleDynamicClick:()=>{},handleDynamicExecute:()=>{u.dynamicExecuteCount.value++},handleDynamicCancel:()=>{u.dynamicCancelCount.value++},handleFormSubmit:()=>{},handleFormSubmitExecute:()=>{u.formSubmitCount.value++,u.isSubmitting.value=!0,u.submitSuccess.value=!1,setTimeout(()=>{u.isSubmitting.value=!1,u.submitSuccess.value=!0,setTimeout(()=>{u.submitSuccess.value=!1},2e3)},1e3)},handleFormReset:()=>{u.formData.value={username:"",email:""},u.submitSuccess.value=!1,u.isSubmitting.value=!1},handleDeleteClick:()=>{u.deleteCount.value++},handleSaveClick:()=>{u.saveCount.value++},handleRefreshClick:()=>{u.refreshCount.value++}}}const se={basic:"基础用法",config:"配置选项",callback:"回调函数",dynamic:"动态配置",scenarios:"实际应用场景"},k={DEFAULT_DELAY:300,SLOW_DELAY:1e3,IMMEDIATE_DELAY:500,CALLBACK_DELAY:800,DELAY_MIN:100,DELAY_MAX:3e3,DELAY_STEP:100,SUBMIT_DELAY:1e3,SUCCESS_DISPLAY_DURATION:2e3};P([{id:1,title:"Vue 3 组件开发指南",description:"深入学习 Vue 3 Composition API 和组件开发最佳实践"},{id:2,title:"TypeScript 高级技巧",description:"掌握 TypeScript 的高级类型系统和泛型编程"},{id:3,title:"JavaScript 性能优化",description:"前端性能优化策略和最佳实践指南"},{id:4,title:"React Hooks 深入理解",description:"全面掌握 React Hooks 的使用场景和原理"},{id:5,title:"CSS Grid 布局完整指南",description:"现代 CSS 网格布局系统的完整学习教程"},{id:6,title:"Node.js 微服务架构",description:"使用 Node.js 构建可扩展的微服务系统"},{id:7,title:"webpack 配置优化",description:"深入理解 webpack 配置和构建优化技巧"},{id:8,title:"Git 工作流最佳实践",description:"团队协作中的 Git 分支管理和工作流程"}]);const me={class:"debounce-demo-page"},re={class:"demo-container"},_e={class:"demo-row"},Ce={class:"demo-row"},pe={class:"demo-row"},ve={class:"demo-container"},fe={class:"demo-row"},be={class:"demo-row"},ke={class:"demo-row"},Ee={class:"demo-container"},Ne={class:"demo-row"},ye={class:"demo-container"},he={class:"form-status"},xe={class:"demo-container"},Se={class:"demo-row"},De={class:"demo-row"},ge={class:"demo-row"},Be=R({__name:"index",setup(u){const o=de(),d=ce(o);return(Ae,n)=>{const L=O,C=K,c=W,y=J,E=j,b=X,D=Q,I=q,N=Z,g=ae,h=ne,M=te,x=le,B=ee,A=H,Y=U,F=oe,v=$("debounce");return _(),T("div",me,[t(L,null,{default:l(()=>[...n[7]||(n[7]=[a("v-debounce 防抖指令场景示例",-1)])]),_:1}),t(F,{cols:2,"x-gap":24,"y-gap":16},{default:l(()=>[t(A,null,{default:l(()=>[t(b,{vertical:"",size:"large"},{default:l(()=>[t(E,{title:"基础防抖演示",size:"small"},{default:l(()=>[s("div",re,[s("div",_e,[f((_(),p(C,{type:"primary",onClick:e(d).handleBasicClick},{default:l(()=>[...n[8]||(n[8]=[a(" 防抖按钮 (300ms) ",-1)])]),_:1},8,["onClick"])),[[v,e(k).DEFAULT_DELAY]]),t(c,{depth:"3"},{default:l(()=>[a("点击计数: "+m(e(o).basicClickCount.value),1)]),_:1})]),s("div",Ce,[f((_(),p(C,{type:"default",onClick:e(d).handleDefaultClick},{default:l(()=>[...n[9]||(n[9]=[a(" 默认防抖按钮 (300ms) ",-1)])]),_:1},8,["onClick"])),[[v]]),t(c,{depth:"3"},{default:l(()=>[a("点击计数: "+m(e(o).defaultClickCount.value),1)]),_:1})]),s("div",pe,[t(C,{type:"warning",onClick:e(d).handleNormalClick},{default:l(()=>[...n[10]||(n[10]=[a(" 普通按钮 (无防抖) ",-1)])]),_:1},8,["onClick"]),t(c,{depth:"3"},{default:l(()=>[a("点击计数: "+m(e(o).normalClickCount.value),1)]),_:1})])]),t(y),t(c,{depth:"3"},{default:l(()=>[...n[11]||(n[11]=[a(" 快速连续点击对比：防抖按钮会延迟执行，普通按钮立即响应每次点击 ",-1)])]),_:1})]),_:1}),t(E,{title:"高级配置演示",size:"small"},{default:l(()=>[s("div",ve,[s("div",fe,[f((_(),p(C,{type:"info",onClick:e(d).handleSlowClick},{default:l(()=>[...n[12]||(n[12]=[a(" 慢速防抖 (1000ms) ",-1)])]),_:1},8,["onClick"])),[[v,{delay:e(k).SLOW_DELAY,onExecute:e(d).handleSlowExecute}]]),t(c,{depth:"3"},{default:l(()=>[a("执行计数: "+m(e(o).slowClickCount.value),1)]),_:1})]),s("div",be,[f((_(),p(C,{type:"success",onClick:e(d).handleImmediateClick},{default:l(()=>[...n[13]||(n[13]=[a(" 立即执行防抖 (500ms) ",-1)])]),_:1},8,["onClick"])),[[v,{delay:e(k).IMMEDIATE_DELAY,immediate:!0,onExecute:e(d).handleImmediateExecute}]]),t(c,{depth:"3"},{default:l(()=>[a("执行计数: "+m(e(o).immediateClickCount.value),1)]),_:1})]),s("div",ke,[f((_(),p(C,{type:"error",onClick:e(d).handleCallbackClick},{default:l(()=>[...n[14]||(n[14]=[a(" 回调演示 (800ms) ",-1)])]),_:1},8,["onClick"])),[[v,{delay:e(k).CALLBACK_DELAY,onExecute:e(d).handleExecuteCallback,onCancel:e(d).handleCancelCallback}]]),t(b,null,{default:l(()=>[t(c,{depth:"3"},{default:l(()=>[a("执行: "+m(e(o).callbackExecuteCount.value),1)]),_:1}),t(c,{depth:"3"},{default:l(()=>[a("取消: "+m(e(o).callbackCancelCount.value),1)]),_:1})]),_:1})])]),t(y),t(c,{depth:"3"},{default:l(()=>[...n[15]||(n[15]=[a(" 支持延迟时间、立即执行、执行和取消回调等配置 ",-1)])]),_:1})]),_:1}),t(E,{title:"动态配置演示",size:"small"},{default:l(()=>[t(b,{vertical:""},{default:l(()=>[t(b,null,{default:l(()=>[t(D,{value:e(o).debounceEnabled.value,"onUpdate:value":n[0]||(n[0]=r=>e(o).debounceEnabled.value=r)},null,8,["value"]),t(c,null,{default:l(()=>[...n[16]||(n[16]=[a("启用防抖",-1)])]),_:1}),t(I,{value:e(o).debounceDelay.value,"onUpdate:value":n[1]||(n[1]=r=>e(o).debounceDelay.value=r),min:e(k).DELAY_MIN,max:e(k).DELAY_MAX,step:e(k).DELAY_STEP,placeholder:"延迟时间",style:{width:"120px"},class:"mt--6px"},null,8,["value","min","max","step"]),t(c,null,{default:l(()=>[...n[17]||(n[17]=[a("ms",-1)])]),_:1}),t(D,{value:e(o).immediateMode.value,"onUpdate:value":n[2]||(n[2]=r=>e(o).immediateMode.value=r)},null,8,["value"]),t(c,null,{default:l(()=>[...n[18]||(n[18]=[a("立即执行",-1)])]),_:1})]),_:1}),s("div",Ee,[s("div",Ne,[f((_(),p(C,{type:"primary",onClick:e(d).handleDynamicClick},{default:l(()=>[...n[19]||(n[19]=[a(" 动态配置按钮 ",-1)])]),_:1},8,["onClick"])),[[v,{disabled:!e(o).debounceEnabled.value,delay:e(o).debounceDelay.value,immediate:e(o).immediateMode.value,onExecute:e(d).handleDynamicExecute,onCancel:e(d).handleDynamicCancel}]]),t(b,null,{default:l(()=>[t(c,{depth:"3"},{default:l(()=>[a("执行: "+m(e(o).dynamicExecuteCount.value),1)]),_:1}),t(c,{depth:"3"},{default:l(()=>[a("取消: "+m(e(o).dynamicCancelCount.value),1)]),_:1})]),_:1})])]),t(b,null,{default:l(()=>[t(N,null,{default:l(()=>[a("防抖状态: "+m(e(o).debounceEnabled.value?"启用":"禁用"),1)]),_:1}),t(N,{type:"info"},{default:l(()=>[a("延迟: "+m(e(o).debounceDelay.value)+"ms",1)]),_:1}),t(N,{type:"success"},{default:l(()=>[a(" 模式: "+m(e(o).immediateMode.value?"立即执行":"延迟执行"),1)]),_:1})]),_:1})]),_:1}),t(y),t(c,{depth:"3"},{default:l(()=>[...n[20]||(n[20]=[a("支持响应式配置，实时修改防抖参数",-1)])]),_:1})]),_:1}),t(E,{title:"实际应用场景",size:"small"},{default:l(()=>[t(B,{value:e(o).scenarioTab.value,"onUpdate:value":n[5]||(n[5]=r=>e(o).scenarioTab.value=r),type:"line",size:"small"},{default:l(()=>[t(x,{name:"submit",tab:"表单提交"},{default:l(()=>[s("div",ye,[t(M,{"label-placement":"left","label-width":"80px"},{default:l(()=>[t(h,{label:"用户名"},{default:l(()=>[t(g,{value:e(o).formData.value.username,"onUpdate:value":n[3]||(n[3]=r=>e(o).formData.value.username=r),placeholder:"请输入用户名"},null,8,["value"])]),_:1}),t(h,{label:"邮箱"},{default:l(()=>[t(g,{value:e(o).formData.value.email,"onUpdate:value":n[4]||(n[4]=r=>e(o).formData.value.email=r),placeholder:"请输入邮箱"},null,8,["value"])]),_:1}),t(h,null,{default:l(()=>[t(b,null,{default:l(()=>[f((_(),p(C,{type:"primary",onClick:e(d).handleFormSubmit,loading:e(o).isSubmitting.value},{default:l(()=>[...n[21]||(n[21]=[a(" 提交表单 (防重复点击) ",-1)])]),_:1},8,["onClick","loading"])),[[v,{delay:e(k).SUBMIT_DELAY,onExecute:e(d).handleFormSubmitExecute}]]),t(C,{type:"default",onClick:e(d).handleFormReset},{default:l(()=>[...n[22]||(n[22]=[a(" 重置 ",-1)])]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1}),s("div",he,[t(b,null,{default:l(()=>[t(N,null,{default:l(()=>[a("提交次数: "+m(e(o).formSubmitCount.value),1)]),_:1}),e(o).submitSuccess.value?(_(),p(N,{key:0,type:"success"},{default:l(()=>[...n[23]||(n[23]=[a(" 提交成功! ",-1)])]),_:1})):z("",!0)]),_:1})])])]),_:1}),t(x,{name:"action",tab:"操作按钮"},{default:l(()=>[s("div",xe,[t(b,{vertical:""},{default:l(()=>[s("div",Se,[f((_(),p(C,{type:"error",onClick:e(d).handleDeleteClick},{default:l(()=>[...n[24]||(n[24]=[a(" 删除操作 (防误删) ",-1)])]),_:1},8,["onClick"])),[[v,500]]),t(c,{depth:"3"},{default:l(()=>[a("删除次数: "+m(e(o).deleteCount.value),1)]),_:1})]),s("div",De,[f((_(),p(C,{type:"warning",onClick:e(d).handleSaveClick},{default:l(()=>[...n[25]||(n[25]=[a(" 保存数据 (防抖保存) ",-1)])]),_:1},8,["onClick"])),[[v,{delay:600,immediate:!1}]]),t(c,{depth:"3"},{default:l(()=>[a("保存次数: "+m(e(o).saveCount.value),1)]),_:1})]),s("div",ge,[f((_(),p(C,{type:"info",onClick:e(d).handleRefreshClick},{default:l(()=>[...n[26]||(n[26]=[a(" 刷新数据 (防抖刷新) ",-1)])]),_:1},8,["onClick"])),[[v,800]]),t(c,{depth:"3"},{default:l(()=>[a("刷新次数: "+m(e(o).refreshCount.value),1)]),_:1})])]),_:1})])]),_:1})]),_:1},8,["value"]),t(y),t(c,{depth:"3"},{default:l(()=>[...n[27]||(n[27]=[a("防止重复点击、误操作等实际业务场景",-1)])]),_:1})]),_:1})]),_:1})]),_:1}),t(A,null,{default:l(()=>[t(E,{title:"使用示例",size:"small"},{default:l(()=>[t(B,{value:e(o).activeTab.value,"onUpdate:value":n[6]||(n[6]=r=>e(o).activeTab.value=r),type:"line",size:"small"},{default:l(()=>[(_(!0),T(V,null,G(e(ie),(r,S)=>(_(),p(x,{key:S,name:S,tab:e(se)[S]},{default:l(()=>[t(Y,{code:r,language:"html"},null,8,["code"])]),_:2},1032,["name","tab"]))),128))]),_:1},8,["value"])]),_:1})]),_:1})]),_:1})])}}}),Pe=ue(Be,[["__scopeId","data-v-396e5c98"]]);export{Pe as default};
