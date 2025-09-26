import V from"./index-BolWzKi2.js";import{r as i,e as z,k as G,aM as P,Q as y,R as m,S as t,U as l,j as o,V as c,l as f,_ as p,K as e,$ as _,Y as H,F as L,N as w}from"./vue-vendor-Bom1XEVO.js";import{aO as F,X,U as W,L as J,P as j,as as Q,af as q,I as Z,V as ee,S as le,a1 as te,a0 as ne,R as ae,aS as oe,aT as ie,aU as de,Y as ue}from"./ui-vendor-lRdd6BJd.js";import{_ as se}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-DdVua9dR.js";import"./spline-vendor-Cs6wJgUK.js";import"./charts-vendor-CvHUaZlk.js";import"./editor-vendor-D83MfH0r.js";const M="<\/script>",re={basic:`<!-- 指定延迟时间 -->
<NButton v-throttle="300" @click="handleClick">
  节流按钮 (300ms)
</NButton>

<!-- 使用默认配置 -->
<NButton v-throttle @click="handleClick">
  默认节流按钮
</NButton>

<!-- 普通按钮对比 -->
<NButton @click="handleClick">
  普通按钮 (无节流)
</NButton>`,config:`<!-- 自定义延迟时间和回调 -->
<NButton v-throttle="{
  delay: 1000,
  onExecute: handleExecute,
  onThrottle: handleThrottle
}" @click="handleClick">
  慢速节流 (1000ms)
</NButton>

<!-- 仅前缘执行 -->
<NButton v-throttle="{
  delay: 500,
  leading: true,
  trailing: false
}" @click="handleClick">
  仅前缘执行
</NButton>

<!-- 仅后缘执行 -->
<NButton v-throttle="{
  delay: 600,
  leading: false,
  trailing: true
}" @click="handleClick">
  仅后缘执行
</NButton>`,callback:`<script setup>
// 回调函数
const handleExecute = () => {
  console.log('节流执行')
}

const handleThrottle = () => {
  console.log('触发节流')
}
${M}

<!-- 回调函数演示 -->
<NButton v-throttle="{
  delay: 500,
  onExecute: handleExecute,
  onThrottle: handleThrottle
}" @click="handleClick">
  回调演示按钮
</NButton>`,dynamic:`<script setup>
const throttleEnabled = ref(true)
const throttleDelay = ref(500)
const leadingMode = ref(true)
const trailingMode = ref(true)

const handleExecute = () => {
  console.log('节流执行')
}

const handleThrottle = () => {
  console.log('触发节流')
}
${M}

<!-- 动态配置 -->
<template>
  <NSpace>
    <NSwitch v-model:value="throttleEnabled" />
    <NText>启用节流</NText>
    
    <NInputNumber v-model:value="throttleDelay" :min="100" :max="3000" />
    <NText>延迟时间(ms)</NText>

    <NSwitch v-model:value="leadingMode" />
    <NText>前缘执行</NText>

    <NSwitch v-model:value="trailingMode" />
    <NText>后缘执行</NText>
  </NSpace>
  
  <NButton v-throttle="{
    disabled: !throttleEnabled,
    delay: throttleDelay,
    leading: leadingMode,
    trailing: trailingMode,
    onExecute: handleExecute,
    onThrottle: handleThrottle
  }" @click="handleClick">
    动态配置节流
  </NButton>
</template>`,scenarios:`<!-- 1. 搜索优化 -->
<NButton 
  v-throttle="{
    delay: 500,
    onExecute: () => console.log('搜索执行')
  }"
  type="primary"
  @click="handleSearch"
  :loading="isSearching"
>
  搜索 (节流 500ms)
</NButton>

<!-- 2. 滚动加载 -->
<NButton 
  v-throttle="{
    delay: 800,
    leading: true,
    trailing: false
  }"
  @click="handleLoadMore"
  :loading="isLoading"
>
  加载更多 (前缘节流)
</NButton>

<!-- 3. 点赞操作 -->
<NButton 
  v-throttle="400"
  type="primary"
  @click="handleLike"
>
  点赞 ❤️ (节流 400ms)
</NButton>

<!-- 4. 分享功能 -->
<NButton 
  v-throttle="{
    delay: 600,
    leading: true,
    trailing: false,
    onExecute: handleShareExecute
  }"
  @click="handleShare"
>
  分享 📤 (前缘节流)
</NButton>`};function ce(){return{activeTab:i("basic"),scenarioTab:i("search"),basicClickCount:i(0),defaultClickCount:i(0),normalClickCount:i(0),slowExecuteCount:i(0),slowThrottleCount:i(0),leadingClickCount:i(0),trailingClickCount:i(0),throttleEnabled:i(!0),throttleDelay:i(500),leadingMode:i(!0),trailingMode:i(!0),dynamicExecuteCount:i(0),dynamicThrottleCount:i(0),searchKeyword:i(""),lastSearchKeyword:i(""),searchCount:i(0),isSearching:i(!1),searchResults:i([{id:1,title:"Vue 3 节流指令使用指南",description:"深入了解 Vue 3 节流指令的使用方法和最佳实践"},{id:2,title:"JavaScript 节流与防抖详解",description:"详细对比节流和防抖的区别，及其在实际项目中的应用"},{id:3,title:"前端性能优化之函数节流",description:"使用函数节流技术优化前端应用性能的实践方案"}]),scrollItems:i(Array.from({length:6},(d,a)=>({id:a+1,timestamp:new Date().toLocaleTimeString()}))),loadCount:i(0),isLoading:i(!1),likeCount:i(0),shareCount:i(0),downloadCount:i(0)}}function _e(d){return{handleBasicClick:()=>d.basicClickCount.value++,handleDefaultClick:()=>d.defaultClickCount.value++,handleNormalClick:()=>d.normalClickCount.value++,handleSlowClick:()=>{},handleSlowExecute:()=>{d.slowExecuteCount.value++},handleSlowThrottle:()=>{d.slowThrottleCount.value++},handleLeadingClick:()=>{},handleLeadingExecute:()=>{d.leadingClickCount.value++},handleTrailingClick:()=>{},handleTrailingExecute:()=>{d.trailingClickCount.value++},handleDynamicClick:()=>{},handleDynamicExecute:()=>{d.dynamicExecuteCount.value++},handleDynamicThrottle:()=>{d.dynamicThrottleCount.value++},handleSearch:()=>{},handleSearchExecute:()=>{d.searchKeyword.value.trim()&&(d.searchCount.value++,d.lastSearchKeyword.value=d.searchKeyword.value,d.isSearching.value=!0,setTimeout(()=>{d.isSearching.value=!1},800))},handleLoadMore:()=>{},handleLoadMoreExecute:()=>{d.loadCount.value++,d.isLoading.value=!0,setTimeout(()=>{const a=Array.from({length:3},(s,S)=>({id:d.scrollItems.value.length+S+1,timestamp:new Date().toLocaleTimeString()}));d.scrollItems.value.push(...a),d.isLoading.value=!1},1e3)},handleLikeClick:()=>{d.likeCount.value++},handleShareClick:()=>{d.shareCount.value++},handleDownloadClick:()=>{d.downloadCount.value++}}}const me={basic:"基础用法",config:"配置选项",callback:"回调函数",dynamic:"动态配置",scenarios:"实际应用场景"},g={DEFAULT_DELAY:300,SLOW_DELAY:1e3,LEADING_DELAY:500,TRAILING_DELAY:600,DELAY_MIN:100,DELAY_MAX:3e3,DELAY_STEP:100,SEARCH_DELAY:500,LOAD_DELAY:800,LIKE_DELAY:400,SHARE_DELAY:600,DOWNLOAD_DELAY:1e3};z([{id:1,title:"Vue 3 节流指令使用指南",description:"深入了解 Vue 3 节流指令的使用方法和最佳实践"},{id:2,title:"JavaScript 节流与防抖详解",description:"详细对比节流和防抖的区别，及其在实际项目中的应用"},{id:3,title:"前端性能优化之函数节流",description:"使用函数节流技术优化前端应用性能的实践方案"},{id:4,title:"React 中的节流处理",description:"在 React 应用中实现函数节流的多种方案对比"},{id:5,title:"移动端滚动优化实践",description:"使用节流技术优化移动端滚动事件的性能表现"},{id:6,title:"API 请求频率控制",description:"通过节流机制控制API请求频率，提升用户体验"}]);const pe={class:"throttle-demo-page"},he={class:"demo-container"},ve={class:"demo-row"},Ce={class:"demo-row"},fe={class:"demo-row"},ge={class:"demo-container"},ke={class:"demo-row"},Ee={class:"demo-row"},ye={class:"demo-row"},Ne={class:"demo-container"},Te={class:"demo-row"},xe={class:"demo-container"},De={class:"search-stats"},Le={key:0,class:"search-results"},we={class:"demo-container"},Se={class:"scroll-container",ref:"scrollContainer"},Ae={class:"load-more-container"},be={class:"load-stats"},Be={class:"demo-container"},Me={class:"demo-row"},Ie={class:"demo-row"},Ye={class:"demo-row"},Re=G({__name:"index",setup(d){const a=ce(),s=_e(a);return(S,n)=>{const I=F,h=j,r=Q,N=q,E=J,v=W,x=Z,Y=ee,k=le,R=ae,A=de,$=ie,U=oe,T=ne,b=te,B=X,K=V,O=ue,C=P("throttle");return m(),y("div",pe,[t(I,null,{default:l(()=>[...n[7]||(n[7]=[o("v-throttle 节流指令场景示例",-1)])]),_:1}),t(O,{cols:2,"x-gap":24,"y-gap":16},{default:l(()=>[t(B,null,{default:l(()=>[t(v,{vertical:"",size:"large"},{default:l(()=>[t(E,{title:"基础节流演示",size:"small"},{default:l(()=>[c("div",he,[c("div",ve,[f((m(),p(h,{type:"primary",onClick:e(s).handleBasicClick},{default:l(()=>[...n[8]||(n[8]=[o(" 节流按钮 (300ms) ",-1)])]),_:1},8,["onClick"])),[[C,e(g).DEFAULT_DELAY]]),t(r,{depth:"3"},{default:l(()=>[o("点击计数: "+_(e(a).basicClickCount.value),1)]),_:1})]),c("div",Ce,[f((m(),p(h,{type:"default",onClick:e(s).handleDefaultClick},{default:l(()=>[...n[9]||(n[9]=[o(" 默认节流按钮 (300ms) ",-1)])]),_:1},8,["onClick"])),[[C]]),t(r,{depth:"3"},{default:l(()=>[o("点击计数: "+_(e(a).defaultClickCount.value),1)]),_:1})]),c("div",fe,[t(h,{type:"warning",onClick:e(s).handleNormalClick},{default:l(()=>[...n[10]||(n[10]=[o(" 普通按钮 (无节流) ",-1)])]),_:1},8,["onClick"]),t(r,{depth:"3"},{default:l(()=>[o("点击计数: "+_(e(a).normalClickCount.value),1)]),_:1})])]),t(N),t(r,{depth:"3"},{default:l(()=>[...n[11]||(n[11]=[o(" 快速连续点击对比：节流按钮在时间间隔内只执行一次，普通按钮响应每次点击 ",-1)])]),_:1})]),_:1}),t(E,{title:"高级配置演示",size:"small"},{default:l(()=>[c("div",ge,[c("div",ke,[f((m(),p(h,{type:"info",onClick:e(s).handleSlowClick},{default:l(()=>[...n[12]||(n[12]=[o(" 慢速节流 (1000ms) ",-1)])]),_:1},8,["onClick"])),[[C,{delay:e(g).SLOW_DELAY,onExecute:e(s).handleSlowExecute,onThrottle:e(s).handleSlowThrottle}]]),t(v,null,{default:l(()=>[t(r,{depth:"3"},{default:l(()=>[o("执行: "+_(e(a).slowExecuteCount.value),1)]),_:1}),t(r,{depth:"3"},{default:l(()=>[o("节流: "+_(e(a).slowThrottleCount.value),1)]),_:1})]),_:1})]),c("div",Ee,[f((m(),p(h,{type:"success",onClick:e(s).handleLeadingClick},{default:l(()=>[...n[13]||(n[13]=[o(" 仅前缘执行 (500ms) ",-1)])]),_:1},8,["onClick"])),[[C,{delay:e(g).LEADING_DELAY,leading:!0,trailing:!1,onExecute:e(s).handleLeadingExecute}]]),t(r,{depth:"3"},{default:l(()=>[o("执行计数: "+_(e(a).leadingClickCount.value),1)]),_:1})]),c("div",ye,[f((m(),p(h,{type:"error",onClick:e(s).handleTrailingClick},{default:l(()=>[...n[14]||(n[14]=[o(" 仅后缘执行 (600ms) ",-1)])]),_:1},8,["onClick"])),[[C,{delay:e(g).TRAILING_DELAY,leading:!1,trailing:!0,onExecute:e(s).handleTrailingExecute}]]),t(r,{depth:"3"},{default:l(()=>[o("执行计数: "+_(e(a).trailingClickCount.value),1)]),_:1})])]),t(N),t(r,{depth:"3"},{default:l(()=>[...n[15]||(n[15]=[o(" 支持前缘执行、后缘执行、延迟时间等配置，提供执行和节流回调 ",-1)])]),_:1})]),_:1}),t(E,{title:"动态配置演示",size:"small"},{default:l(()=>[t(v,{vertical:""},{default:l(()=>[t(v,null,{default:l(()=>[t(x,{value:e(a).throttleEnabled.value,"onUpdate:value":n[0]||(n[0]=u=>e(a).throttleEnabled.value=u)},null,8,["value"]),t(r,null,{default:l(()=>[...n[16]||(n[16]=[o("启用节流",-1)])]),_:1}),t(Y,{value:e(a).throttleDelay.value,"onUpdate:value":n[1]||(n[1]=u=>e(a).throttleDelay.value=u),min:e(g).DELAY_MIN,max:e(g).DELAY_MAX,step:e(g).DELAY_STEP,placeholder:"延迟时间",style:{width:"120px"},class:"mt--6px"},null,8,["value","min","max","step"]),t(r,null,{default:l(()=>[...n[17]||(n[17]=[o("ms",-1)])]),_:1})]),_:1}),t(v,null,{default:l(()=>[t(x,{value:e(a).leadingMode.value,"onUpdate:value":n[2]||(n[2]=u=>e(a).leadingMode.value=u)},null,8,["value"]),t(r,null,{default:l(()=>[...n[18]||(n[18]=[o("前缘执行",-1)])]),_:1}),t(x,{value:e(a).trailingMode.value,"onUpdate:value":n[3]||(n[3]=u=>e(a).trailingMode.value=u)},null,8,["value"]),t(r,null,{default:l(()=>[...n[19]||(n[19]=[o("后缘执行",-1)])]),_:1})]),_:1}),c("div",Ne,[c("div",Te,[f((m(),p(h,{type:"primary",onClick:e(s).handleDynamicClick},{default:l(()=>[...n[20]||(n[20]=[o(" 动态配置按钮 ",-1)])]),_:1},8,["onClick"])),[[C,{disabled:!e(a).throttleEnabled.value,delay:e(a).throttleDelay.value,leading:e(a).leadingMode.value,trailing:e(a).trailingMode.value,onExecute:e(s).handleDynamicExecute,onThrottle:e(s).handleDynamicThrottle}]]),t(v,null,{default:l(()=>[t(r,{depth:"3"},{default:l(()=>[o("执行: "+_(e(a).dynamicExecuteCount.value),1)]),_:1}),t(r,{depth:"3"},{default:l(()=>[o("节流: "+_(e(a).dynamicThrottleCount.value),1)]),_:1})]),_:1})])]),t(v,null,{default:l(()=>[t(k,null,{default:l(()=>[o("节流状态: "+_(e(a).throttleEnabled.value?"启用":"禁用"),1)]),_:1}),t(k,{type:"info"},{default:l(()=>[o("延迟: "+_(e(a).throttleDelay.value)+"ms",1)]),_:1}),t(k,{type:"success"},{default:l(()=>[o(" 前缘: "+_(e(a).leadingMode.value?"开启":"关闭"),1)]),_:1}),t(k,{type:"warning"},{default:l(()=>[o(" 后缘: "+_(e(a).trailingMode.value?"开启":"关闭"),1)]),_:1})]),_:1})]),_:1}),t(N),t(r,{depth:"3"},{default:l(()=>[...n[21]||(n[21]=[o("支持响应式配置，实时修改节流参数和执行模式",-1)])]),_:1})]),_:1}),t(E,{title:"实际应用场景",size:"small"},{default:l(()=>[t(b,{value:e(a).scenarioTab.value,"onUpdate:value":n[5]||(n[5]=u=>e(a).scenarioTab.value=u),type:"line",size:"small"},{default:l(()=>[t(T,{name:"search",tab:"搜索优化"},{default:l(()=>[c("div",xe,[t(v,{vertical:""},{default:l(()=>[t(v,null,{default:l(()=>[t(R,{value:e(a).searchKeyword.value,"onUpdate:value":n[4]||(n[4]=u=>e(a).searchKeyword.value=u),placeholder:"输入搜索关键词",style:{width:"300px"}},null,8,["value"]),f((m(),p(h,{type:"primary",onClick:e(s).handleSearch,loading:e(a).isSearching.value},{default:l(()=>[...n[22]||(n[22]=[o(" 搜索 (节流 500ms) ",-1)])]),_:1},8,["onClick","loading"])),[[C,{delay:e(g).SEARCH_DELAY,onExecute:e(s).handleSearchExecute}]])]),_:1}),c("div",De,[t(v,null,{default:l(()=>[t(k,null,{default:l(()=>[o("搜索次数: "+_(e(a).searchCount.value),1)]),_:1}),t(k,{type:"info"},{default:l(()=>[o("关键词: "+_(e(a).lastSearchKeyword.value||"暂无"),1)]),_:1})]),_:1})]),e(a).searchResults.value.length>0?(m(),y("div",Le,[t(U,null,{default:l(()=>[(m(!0),y(L,null,w(e(a).searchResults.value,u=>(m(),p($,{key:u.id},{default:l(()=>[t(A,{title:u.title,description:u.description},null,8,["title","description"])]),_:2},1024))),128))]),_:1})])):H("",!0)]),_:1})])]),_:1}),t(T,{name:"scroll",tab:"滚动加载"},{default:l(()=>[c("div",we,[c("div",Se,[(m(!0),y(L,null,w(e(a).scrollItems.value,u=>(m(),y("div",{key:u.id,class:"scroll-item"},[t(E,{size:"small"},{default:l(()=>[t(A,{title:`数据项 ${u.id}`,description:`这是第 ${u.id} 条数据，时间: ${u.timestamp}`},null,8,["title","description"])]),_:2},1024)]))),128)),c("div",Ae,[f((m(),p(h,{type:"default",onClick:e(s).handleLoadMore,loading:e(a).isLoading.value,block:""},{default:l(()=>[...n[23]||(n[23]=[o(" 加载更多 (节流 800ms) ",-1)])]),_:1},8,["onClick","loading"])),[[C,{delay:e(g).LOAD_DELAY,onExecute:e(s).handleLoadMoreExecute}]])])],512),c("div",be,[t(v,null,{default:l(()=>[t(k,null,{default:l(()=>[o("加载次数: "+_(e(a).loadCount.value),1)]),_:1}),t(k,{type:"success"},{default:l(()=>[o("总数据: "+_(e(a).scrollItems.value.length),1)]),_:1})]),_:1})])])]),_:1}),t(T,{name:"action",tab:"高频操作"},{default:l(()=>[c("div",Be,[t(v,{vertical:""},{default:l(()=>[c("div",Me,[f((m(),p(h,{type:"primary",onClick:e(s).handleLikeClick},{default:l(()=>[...n[24]||(n[24]=[o(" 点赞 ❤️ (节流 400ms) ",-1)])]),_:1},8,["onClick"])),[[C,400]]),t(r,{depth:"3"},{default:l(()=>[o("点赞数: "+_(e(a).likeCount.value),1)]),_:1})]),c("div",Ie,[f((m(),p(h,{type:"info",onClick:e(s).handleShareClick},{default:l(()=>[...n[25]||(n[25]=[o(" 分享 📤 (前缘节流 600ms) ",-1)])]),_:1},8,["onClick"])),[[C,{delay:600,leading:!0,trailing:!1}]]),t(r,{depth:"3"},{default:l(()=>[o("分享次数: "+_(e(a).shareCount.value),1)]),_:1})]),c("div",Ye,[f((m(),p(h,{type:"warning",onClick:e(s).handleDownloadClick},{default:l(()=>[...n[26]||(n[26]=[o(" 下载 📥 (后缘节流 1000ms) ",-1)])]),_:1},8,["onClick"])),[[C,{delay:1e3,leading:!1,trailing:!0}]]),t(r,{depth:"3"},{default:l(()=>[o("下载次数: "+_(e(a).downloadCount.value),1)]),_:1})])]),_:1})])]),_:1})]),_:1},8,["value"]),t(N),t(r,{depth:"3"},{default:l(()=>[...n[27]||(n[27]=[o("搜索优化、滚动加载、高频操作等实际业务场景",-1)])]),_:1})]),_:1})]),_:1})]),_:1}),t(B,null,{default:l(()=>[t(E,{title:"使用示例",size:"small"},{default:l(()=>[t(b,{value:e(a).activeTab.value,"onUpdate:value":n[6]||(n[6]=u=>e(a).activeTab.value=u),type:"line",size:"small"},{default:l(()=>[(m(!0),y(L,null,w(e(re),(u,D)=>(m(),p(T,{key:D,name:D,tab:e(me)[D]},{default:l(()=>[t(K,{code:u,language:"html"},null,8,["code"])]),_:2},1032,["name","tab"]))),128))]),_:1},8,["value"])]),_:1})]),_:1})]),_:1})])}}}),He=se(Re,[["__scopeId","data-v-3daba0f3"]]);export{He as default};
