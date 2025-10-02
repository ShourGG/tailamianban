import k from"./index-BEgtnFVO.js";import{r as s,k as x,ar as P,P as V,Q as m,R as t,S as n,j as a,U as g,l as N,Z as T,J as e,_ as i,L}from"./vue-vendor-DgJqRHrX.js";import{aJ as M,a4 as z,K as $,X as q,M as G,at as X,Y as F,U as Q,a2 as Y,L as H,a9 as J,a8 as W,a5 as j}from"./ui-vendor-Dblj447Y.js";import{_ as K}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-DAKaZtA3.js";import"./spline-vendor-Btm54g1Q.js";import"./charts-vendor-DjXuxi75.js";import"./editor-vendor-BwkH8h9-.js";function Z(){return{activeTab:s("basic"),basicCount:s(0),defaultCount:s(0),normalCount:s(0),slowCount:s(0),slowCancelCount:s(0),progressValue:s(0),enabled:s(!0),duration:s(800),dynamicCount:s(0),deleteCount:s(0),quantity:s(1),isIncreasing:s(!1)}}function h(_){let o=null;return{handleBasicClick:()=>{},handleDefaultClick:()=>{},handleProgress:(u,U)=>{_.progressValue.value=Math.round(u*100)},startIncrease:()=>{_.isIncreasing.value=!0},continuousIncrease:()=>{if(_.isIncreasing.value){const u=()=>{_.isIncreasing.value&&_.quantity.value<999&&(_.quantity.value++,o=setTimeout(u,100))};u()}},stopIncrease:()=>{_.isIncreasing.value=!1,o&&(clearTimeout(o),o=null)}}}const A={basic:`<!-- 基础长按 -->
<NButton v-longpress="{
  duration: 800,
  onTrigger: () => count++
}">
  长按按钮 (800ms)
</NButton>

<!-- 默认配置 -->
<NButton v-longpress="{
  duration: 800,
  onTrigger: () => defaultCount++
}">
  默认长按按钮
</NButton>

<!-- 普通按钮对比 -->
<NButton @click="normalCount++">
  普通按钮 (无长按)
</NButton>`,config:`<!-- 慢速长按配置 -->
<NButton v-longpress="{
  duration: 2000,
  onStart: () => console.log('开始'),
  onTrigger: () => slowCount++,
  onCancel: () => slowCancelCount++
}">
  慢速长按 (2000ms)
</NButton>

<!-- 进度跟踪长按 -->
<NButton v-longpress="{
  duration: 1500,
  onProgress: handleProgress,
  onTrigger: () => {
    progressValue = 100
    setTimeout(() => progressValue = 0, 1000)
  }
}">
  进度长按 (1500ms)
</NButton>`,scenarios:`<!-- 危险操作确认 -->
<NButton v-longpress="{
  duration: 2000,
  onTrigger: () => handleDelete()
}" type="error">
  长按删除 (2000ms)
</NButton>

<!-- 连续数量调节 -->
<NButton v-longpress="{
  duration: 300,
  onStart: startIncrease,
  onTrigger: continuousIncrease,
  onCancel: stopIncrease
}" @click="quantity++">
  + 数量调节
</NButton>

<!-- 动态配置 -->
<NButton v-longpress="{
  disabled: !enabled,
  duration: duration,
  onTrigger: () => dynamicCount++
}">
  动态配置按钮
</NButton>`},d={DEFAULT_DURATION:800,SLOW_DURATION:2e3,PROGRESS_DURATION:1500,DELETE_DURATION:2e3,QUANTITY_DURATION:300,DURATION_MIN:200,DURATION_MAX:5e3,DURATION_STEP:100,MAX_QUANTITY:999,INCREASE_INTERVAL:100},ee={class:"longpress-demo-page"},ne={class:"demo-row"},te={class:"demo-row"},oe={class:"demo-row"},le={class:"demo-row"},ae={class:"demo-row progress-demo"},se={class:"demo-row"},ue={class:"demo-row"},re={class:"demo-row"},ie=x({__name:"index",setup(_){const o=Z(),u=h(o);return(U,l)=>{const B=M,c=G,r=X,p=$,C=q,O=F,R=Q,w=Y,y=H,b=z,I=k,D=W,E=J,S=j,v=P("longpress");return m(),V("div",ee,[t(B,null,{default:n(()=>[...l[5]||(l[5]=[a("v-longpress 长按指令场景示例",-1)])]),_:1}),t(S,{cols:2,"x-gap":24,"y-gap":16},{default:n(()=>[t(b,null,{default:n(()=>[t(p,{vertical:"",size:"large"},{default:n(()=>[t(C,{title:"基础演示",size:"small"},{default:n(()=>[t(p,{vertical:""},{default:n(()=>[g("div",ne,[N((m(),T(c,{type:"primary",onClick:e(u).handleBasicClick},{default:n(()=>[...l[6]||(l[6]=[a(" 长按按钮 (800ms) ",-1)])]),_:1},8,["onClick"])),[[v,{duration:e(d).DEFAULT_DURATION,onTrigger:()=>e(o).basicCount.value++}]]),t(r,null,{default:n(()=>[a("长按触发次数: "+i(e(o).basicCount.value),1)]),_:1})]),g("div",te,[N((m(),T(c,{onClick:e(u).handleDefaultClick},{default:n(()=>[...l[7]||(l[7]=[a(" 默认长按按钮 ",-1)])]),_:1},8,["onClick"])),[[v,{duration:e(d).DEFAULT_DURATION,onTrigger:()=>e(o).defaultCount.value++}]]),t(r,null,{default:n(()=>[a("长按触发次数: "+i(e(o).defaultCount.value),1)]),_:1})]),g("div",oe,[t(c,{onClick:l[0]||(l[0]=f=>e(o).normalCount.value++)},{default:n(()=>[...l[8]||(l[8]=[a(" 普通按钮 (无长按) ",-1)])]),_:1}),t(r,null,{default:n(()=>[a("点击次数: "+i(e(o).normalCount.value),1)]),_:1})])]),_:1})]),_:1}),t(C,{title:"高级配置",size:"small"},{default:n(()=>[t(p,{vertical:""},{default:n(()=>[g("div",le,[N((m(),T(c,{type:"info"},{default:n(()=>[...l[9]||(l[9]=[a(" 慢速长按 (2000ms) ",-1)])]),_:1})),[[v,{duration:e(d).SLOW_DURATION,onStart:()=>{},onTrigger:()=>e(o).slowCount.value++,onCancel:()=>e(o).slowCancelCount.value++}]]),t(p,null,{default:n(()=>[t(r,null,{default:n(()=>[a("触发: "+i(e(o).slowCount.value),1)]),_:1}),t(r,null,{default:n(()=>[a("取消: "+i(e(o).slowCancelCount.value),1)]),_:1})]),_:1})]),g("div",ae,[N((m(),T(c,{type:"error",class:"progress-button",style:L({"--progress":e(o).progressValue.value+"%"})},{default:n(()=>[...l[10]||(l[10]=[a(" 进度长按 (1500ms) ",-1)])]),_:1},8,["style"])),[[v,{duration:e(d).PROGRESS_DURATION,onProgress:e(u).handleProgress,onTrigger:()=>{e(o).progressValue.value=100,U.setTimeout(()=>e(o).progressValue.value=0,1e3)}}]]),t(O,{percentage:e(o).progressValue.value,"show-indicator":!1,style:{width:"200px"}},null,8,["percentage"])])]),_:1})]),_:1}),t(C,{title:"动态配置",size:"small"},{default:n(()=>[t(p,{vertical:""},{default:n(()=>[t(p,null,{default:n(()=>[t(R,{value:e(o).enabled.value,"onUpdate:value":l[1]||(l[1]=f=>e(o).enabled.value=f)},null,8,["value"]),t(r,null,{default:n(()=>[...l[11]||(l[11]=[a("启用长按",-1)])]),_:1}),t(w,{value:e(o).duration.value,"onUpdate:value":l[2]||(l[2]=f=>e(o).duration.value=f),min:e(d).DURATION_MIN,max:e(d).DURATION_MAX,step:e(d).DURATION_STEP,style:{width:"120px"},class:"mt--8px"},null,8,["value","min","max","step"]),t(r,null,{default:n(()=>[...l[12]||(l[12]=[a("ms",-1)])]),_:1})]),_:1}),g("div",se,[N((m(),T(c,{type:"primary"},{default:n(()=>[...l[13]||(l[13]=[a(" 动态配置按钮 ",-1)])]),_:1})),[[v,{disabled:!e(o).enabled.value,duration:e(o).duration.value,onTrigger:()=>e(o).dynamicCount.value++}]]),t(r,null,{default:n(()=>[a("触发次数: "+i(e(o).dynamicCount.value),1)]),_:1})]),t(p,null,{default:n(()=>[t(y,null,{default:n(()=>[a("状态: "+i(e(o).enabled.value?"启用":"禁用"),1)]),_:1}),t(y,{type:"info"},{default:n(()=>[a("持续时间: "+i(e(o).duration.value)+"ms",1)]),_:1})]),_:1})]),_:1})]),_:1}),t(C,{title:"实际应用",size:"small"},{default:n(()=>[t(p,{vertical:""},{default:n(()=>[g("div",ue,[N((m(),T(c,{type:"error"},{default:n(()=>[...l[14]||(l[14]=[a(" 长按删除 (2000ms) ",-1)])]),_:1})),[[v,{duration:e(d).DELETE_DURATION,onTrigger:()=>e(o).deleteCount.value++}]]),t(r,null,{default:n(()=>[a("删除次数: "+i(e(o).deleteCount.value),1)]),_:1})]),g("div",re,[N((m(),T(c,{onClick:l[3]||(l[3]=f=>e(o).quantity.value++)},{default:n(()=>[...l[15]||(l[15]=[a(" + 数量调节 ",-1)])]),_:1})),[[v,{duration:e(d).QUANTITY_DURATION,onStart:e(u).startIncrease,onTrigger:e(u).continuousIncrease,onCancel:e(u).stopIncrease}]]),t(r,null,{default:n(()=>[a("数量: "+i(e(o).quantity.value),1)]),_:1})])]),_:1})]),_:1})]),_:1})]),_:1}),t(b,null,{default:n(()=>[t(C,{title:"使用示例",size:"small"},{default:n(()=>[t(E,{value:e(o).activeTab.value,"onUpdate:value":l[4]||(l[4]=f=>e(o).activeTab.value=f),type:"line",size:"small"},{default:n(()=>[t(D,{name:"basic",tab:"基础用法"},{default:n(()=>[t(I,{code:e(A).basic,language:"html"},null,8,["code"])]),_:1}),t(D,{name:"config",tab:"配置选项"},{default:n(()=>[t(I,{code:e(A).config,language:"html"},null,8,["code"])]),_:1}),t(D,{name:"scenarios",tab:"应用场景"},{default:n(()=>[t(I,{code:e(A).scenarios,language:"html"},null,8,["code"])]),_:1})]),_:1},8,["value"])]),_:1})]),_:1})]),_:1})])}}}),Ne=K(ie,[["__scopeId","data-v-53704081"]]);export{Ne as default};
