import G from"./index-DvhOqMJr.js";import{k as P,r as S,aM as Y,Q as j,R as l,S as s,U as t,j as o,l as p,_ as a,V as u,K as n,a3 as z,Y as q,$}from"./vue-vendor-Bom1XEVO.js";import{aA as K,aO as L,X as O,U as Q,L as X,P as F,S as J,af as Z,as as h,W as ee,R as te,a1 as se,a0 as ne,Y as oe}from"./ui-vendor-lRdd6BJd.js";import"./index-CkMMG6vV.js";import"./spline-vendor-Cs6wJgUK.js";import"./charts-vendor-CvHUaZlk.js";import"./editor-vendor-D83MfH0r.js";import"./_plugin-vue_export-helper-DlAUqK2U.js";function le(){return`<!-- 基础文本复制 -->
<NButton v-copy="'Hello World!'">复制文本</NButton>

<!-- 复制元素内容 -->
<NAlert v-copy>点击复制这段文本</NAlert>

<!-- 复制响应式数据 -->
<NButton v-copy="inputText">复制输入内容</NButton>`}function ae(){return`<script setup>
const message = useMessage()

// 统计回调
const handleCopySuccess = (text) => {
  copyCount.value++
  lastCopyText.value = text
}
<\/script>

<!-- 使用 useMessage 显示提示 -->
<NButton v-copy="{
  text: 'Hello World!',
  messageInstance: message,
  onSuccess: handleCopySuccess
}">复制并提示</NButton>

<!-- 复制元素内容并提示 -->
<NAlert v-copy="{
  messageInstance: message,
  onSuccess: handleCopySuccess
}">点击复制这段文本</NAlert>`}function ue(){return`<!-- 自定义成功消息 -->
<NButton v-copy="{
  text: '内容',
  successMessage: '🎉 复制成功了！',
  messageInstance: message,
  onSuccess: handleCopySuccess
}">自定义消息</NButton>

<!-- 静默复制，不显示消息 -->
<NButton v-copy="{
  text: '内容',
  successMessage: false,
  onSuccess: handleSilentSuccess
}">静默模式</NButton>`}const ce={class:"copy-demo-page"},ve=P({__name:"index",setup(k){const c=K(),x=S("basic"),m=S("这是动态文本内容"),C=S(0),f=S(""),_=g=>{C.value++,f.value=g},A=g=>{C.value++,f.value=g},H=le(),V=ae(),D=ue();return(g,e)=>{const U=L,v=F,B=J,r=Q,y=Z,N=h,i=X,W=ee,E=te,M=O,b=G,T=ne,R=se,w=oe,d=Y("copy");return l(),j("div",ce,[s(U,null,{default:t(()=>[...e[2]||(e[2]=[o("v-copy 复制指令场景示例",-1)])]),_:1}),s(w,{cols:2,"x-gap":24,"y-gap":16},{default:t(()=>[s(M,null,{default:t(()=>[s(r,{vertical:"",size:"large"},{default:t(()=>[s(i,{title:"基础文本复制",size:"small"},{default:t(()=>[s(r,null,{default:t(()=>[p((l(),a(v,{type:"primary"},{icon:t(()=>[...e[3]||(e[3]=[u("div",{class:"i-mdi:content-copy"},null,-1)])]),default:t(()=>[e[4]||(e[4]=o(" 复制文本 ",-1))]),_:1})),[[d,{text:"Hello World!",messageInstance:n(c),onSuccess:_}]]),p((l(),a(B,{clickable:""},{default:t(()=>[...e[5]||(e[5]=[o(" 复制标签 ",-1)])]),_:1})),[[d,{text:"这是标签内容",messageInstance:n(c),onSuccess:_}]])]),_:1}),s(y),s(N,{depth:"3"},{default:t(()=>[...e[6]||(e[6]=[o("点击按钮或标签复制内容到剪贴板，会自动显示消息提示",-1)])]),_:1})]),_:1}),s(i,{title:"复制元素内容",size:"small"},{default:t(()=>[p((l(),a(W,{type:"info"},{icon:t(()=>[...e[7]||(e[7]=[u("div",{class:"i-mdi:information"},null,-1)])]),default:t(()=>[e[8]||(e[8]=o(" 点击这个提示框复制整段内容：这是一段重要信息，可以通过点击复制。 ",-1))]),_:1})),[[d,{messageInstance:n(c),onSuccess:_}]]),s(y),s(N,{depth:"3"},{default:t(()=>[...e[9]||(e[9]=[o("不传参数时，自动复制元素的文本内容",-1)])]),_:1})]),_:1}),s(i,{title:"动态内容复制",size:"small"},{default:t(()=>[s(r,{vertical:""},{default:t(()=>[s(E,{value:n(m),"onUpdate:value":e[0]||(e[0]=I=>z(m)?m.value=I:null),placeholder:"输入要复制的内容",clearable:""},null,8,["value"]),p((l(),a(v,{disabled:!n(m)},{icon:t(()=>[...e[10]||(e[10]=[u("div",{class:"i-mdi:content-copy"},null,-1)])]),default:t(()=>[e[11]||(e[11]=o(" 复制输入内容 ",-1))]),_:1},8,["disabled"])),[[d,{text:n(m),messageInstance:n(c),onSuccess:_}]])]),_:1}),s(y),s(N,{depth:"3"},{default:t(()=>[...e[12]||(e[12]=[o("复制响应式数据，内容会实时更新",-1)])]),_:1})]),_:1}),s(i,{title:"高级配置",size:"small"},{default:t(()=>[s(r,null,{default:t(()=>[p((l(),a(v,{type:"success"},{icon:t(()=>[...e[13]||(e[13]=[u("div",{class:"i-mdi:settings"},null,-1)])]),default:t(()=>[e[14]||(e[14]=o(" 自定义消息 ",-1))]),_:1})),[[d,{text:"自定义消息内容",onSuccess:_,successMessage:"🎉 复制成功了！",messageInstance:n(c)}]]),p((l(),a(v,{quaternary:""},{icon:t(()=>[...e[15]||(e[15]=[u("div",{class:"i-mdi:volume-off"},null,-1)])]),default:t(()=>[e[16]||(e[16]=o(" 静默模式 ",-1))]),_:1})),[[d,{text:"静默复制内容",successMessage:!1,onSuccess:A}]])]),_:1}),s(y),s(N,{depth:"3"},{default:t(()=>[...e[17]||(e[17]=[o("支持自定义回调函数、消息提示和独立消息实例",-1)])]),_:1})]),_:1})]),_:1})]),_:1}),s(M,null,{default:t(()=>[s(i,{title:"使用代码",size:"small"},{default:t(()=>[s(R,{value:n(x),"onUpdate:value":e[1]||(e[1]=I=>z(x)?x.value=I:null),type:"line",size:"small"},{default:t(()=>[s(T,{name:"basic",tab:"基础用法"},{default:t(()=>[s(b,{code:n(H),language:"html"},null,8,["code"])]),_:1}),s(T,{name:"message",tab:"消息提示"},{default:t(()=>[s(b,{code:n(V),language:"html"},null,8,["code"])]),_:1}),s(T,{name:"advanced",tab:"高级配置"},{default:t(()=>[s(b,{code:n(D),language:"html"},null,8,["code"])]),_:1})]),_:1},8,["value"])]),_:1}),s(i,{title:"复制统计",size:"small",class:"mt-4"},{default:t(()=>[s(r,null,{default:t(()=>[s(B,{type:"info"},{icon:t(()=>[...e[18]||(e[18]=[u("div",{class:"i-mdi:counter"},null,-1)])]),default:t(()=>[o(" 复制次数: "+$(n(C)),1)]),_:1}),n(f)?(l(),a(B,{key:0,type:"success"},{icon:t(()=>[...e[19]||(e[19]=[u("div",{class:"i-mdi:check"},null,-1)])]),default:t(()=>[o(" 最后复制: "+$(n(f).substring(0,15))+"... ",1)]),_:1})):q("",!0)]),_:1})]),_:1})]),_:1})]),_:1})])}}});export{ve as default};
