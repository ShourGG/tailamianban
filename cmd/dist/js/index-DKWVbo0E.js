import j from"./index-DSt-SbIo.js";import{aJ as K,a4 as M,K as Q,X as q,ae as Z,at as h,a3 as tt,a0 as et,aW as at,a2 as lt,L as nt,a9 as ot,a8 as st,M as rt,aA as it,a5 as dt}from"./ui-vendor-Dblj447Y.js";import{k as ut,r as _,c as pt,ar as mt,P as i,Q as d,R as e,S as a,j as n,l as p,U as l,a2 as g,J as o,_ as N}from"./vue-vendor-DgJqRHrX.js";import{_ as _t}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-DbUecRfU.js";import"./spline-vendor-Btm54g1Q.js";import"./charts-vendor-DjXuxi75.js";import"./editor-vendor-BwkH8h9-.js";function vt(){return`<!-- 基础文本水印 -->
<div v-watermark="'版权所有'"> 
  <p>这是一段内容</p>
</div>

<!-- 使用默认水印 -->
<div v-watermark>
  <p>使用默认Robot Admin文本</p>
</div>

<!-- 简单配置 -->
<div v-watermark="{
  text: '机密文档',
  textColor: 'rgba(255, 0, 0, 0.3)'
}">
  <p>重要内容区域</p>
</div>`}function ft(){return`<!-- 自定义字体和大小 -->
<div v-watermark="{
  text: '内部资料',
  fontSize: 20,
  font: 'Arial',
  textColor: 'rgba(0, 123, 255, 0.4)'
}">
  <p>内容区域</p>
</div>

<!-- 调整间距和旋转角度 -->
<div v-watermark="{
  text: 'CONFIDENTIAL',
  textXGap: 180,
  textYGap: 90,
  rotate: -45,
  opacity: 0.8
}">
  <p>机密内容</p>
</div>`}function xt(){return`<script setup>
// 动态水印文本
const watermarkText = ref('动态水印')
const showWatermark = ref(true)

// 回调函数
const handleWatermarkUpdate = (el) => {
  console.log('水印更新:', el)
}

const handleWatermarkError = (error) => {
  console.error('水印错误:', error)
}
<\/script>

<!-- 动态水印 -->
<div v-watermark="{
  text: watermarkText,
  onUpdate: handleWatermarkUpdate,
  onError: handleWatermarkError
}">
  <p>动态内容</p>
</div>

<!-- 条件水印 -->
<div v-if="showWatermark" v-watermark="'条件显示'">
  <p>条件内容</p>
</div>`}function gt(){return`<!-- 文档场景 -->
<div v-watermark="{
  text: '草稿',
  textColor: 'rgba(255, 165, 0, 0.3)',
  fontSize: 18
}" class="document">
  <h3>文档标题</h3>
  <p>文档内容...</p>
</div>

<!-- 图片预览场景 -->
<div v-watermark="{
  text: '仅供预览',
  textColor: 'rgba(255, 255, 255, 0.7)',
  fontSize: 24,
  rotate: 45,
  textXGap: 220,
  textYGap: 120
}" class="image-preview">
  <img src="/api/placeholder/400/300" alt="预览图片" />
</div>

<!-- 表格数据场景 -->
<div v-watermark="{
  text: '内部数据',
  textColor: 'rgba(220, 20, 60, 0.25)',
  fontSize: 14
}" class="data-table">
  <NDataTable :data="tableData" :columns="columns" />
</div>`}const ct=[{id:1,name:"张三",department:"技术部",salary:"15000",status:"在职"},{id:2,name:"李四",department:"市场部",salary:"12000",status:"在职"},{id:3,name:"王五",department:"财务部",salary:"13000",status:"在职"}],bt=[{title:"ID",key:"id",width:60},{title:"姓名",key:"name"},{title:"部门",key:"department"},{title:"薪资",key:"salary"},{title:"状态",key:"status"}],kt={class:"watermark-demo-page"},Ct={class:"demo-box"},yt={class:"demo-box"},wt={class:"demo-box"},zt={class:"demo-box"},Nt={class:"demo-box"},St={class:"demo-box document-style"},Dt={class:"demo-box image-style"},Gt={class:"demo-box"},Tt=ut({__name:"index",setup(U){const c=_("basic"),z=_("document"),f=_("动态水印"),b=_("rgba(180, 180, 180, 0.4)"),k=_(16),S=_(0),A=_(0),$=pt(()=>new Date().toLocaleDateString("zh-CN")),I=D=>{S.value++},W=D=>{A.value++},X=vt(),B=ft(),Y=xt(),L=gt();return(D,t)=>{const R=K,s=Q,C=Z,y=h,x=q,P=tt,V=et,F=at,H=lt,G=nt,v=rt,m=st,J=it,T=ot,E=M,w=j,O=dt,u=mt("watermark");return d(),i("div",kt,[e(R,null,{default:a(()=>[...t[5]||(t[5]=[n("v-watermark 水印指令场景示例",-1)])]),_:1}),e(O,{cols:2,"x-gap":24,"y-gap":16},{default:a(()=>[e(E,null,{default:a(()=>[e(s,{vertical:"",size:"large"},{default:a(()=>[e(x,{title:"基础水印演示",size:"small"},{default:a(()=>[e(s,{vertical:""},{default:a(()=>[p((d(),i("div",Ct,[...t[6]||(t[6]=[l("h4",null,"基础文本水印",-1),l("p",null,"这是一个带有基础文本水印的区域，水印会自动重复显示在背景中。",-1)])])),[[u,"版权所有"]]),p((d(),i("div",yt,[...t[7]||(t[7]=[l("h4",null,"默认水印",-1),l("p",null,'使用默认的 "Robot Admin" 文本作为水印。',-1)])])),[[u]])]),_:1}),e(C),e(y,{depth:"3"},{default:a(()=>[...t[8]||(t[8]=[n("最简单的使用方式，支持字符串和默认配置",-1)])]),_:1})]),_:1}),e(x,{title:"样式自定义演示",size:"small"},{default:a(()=>[e(s,{vertical:""},{default:a(()=>[p((d(),i("div",wt,[t[11]||(t[11]=l("h4",null,"自定义样式",-1)),t[12]||(t[12]=l("p",null,"红色、Arial字体、20px大小的水印效果。",-1)),e(P,{type:"warning"},{icon:a(()=>[...t[9]||(t[9]=[l("div",{class:"i-mdi:alert"},null,-1)])]),default:a(()=>[t[10]||(t[10]=n(" 重要提醒内容 ",-1))]),_:1})])),[[u,{text:"机密文档",textColor:"rgba(255, 0, 0, 0.3)",fontSize:20,font:"Arial"}]]),p((d(),i("div",zt,[...t[13]||(t[13]=[l("h4",null,"间距和角度调整",-1),l("p",null,"调整水印间距为180x90，旋转角度-45度。",-1)])])),[[u,{text:"CONFIDENTIAL",textColor:"rgba(0, 123, 255, 0.25)",fontSize:16,textXGap:180,textYGap:90,rotate:-45}]])]),_:1}),e(C),e(y,{depth:"3"},{default:a(()=>[...t[14]||(t[14]=[n("支持字体、颜色、大小、间距、角度等样式自定义",-1)])]),_:1})]),_:1}),e(x,{title:"动态内容演示",size:"small"},{default:a(()=>[e(s,{vertical:""},{default:a(()=>[e(s,null,{default:a(()=>[e(V,{value:o(f),"onUpdate:value":t[0]||(t[0]=r=>g(f)?f.value=r:null),placeholder:"输入水印文本",style:{width:"200px"}},null,8,["value"]),e(F,{value:o(b),"onUpdate:value":t[1]||(t[1]=r=>g(b)?b.value=r:null),"show-alpha":!0,class:"mr-140px"},null,8,["value"]),e(H,{value:o(k),"onUpdate:value":t[2]||(t[2]=r=>g(k)?k.value=r:null),min:12,max:36,placeholder:"字体大小"},null,8,["value"])]),_:1}),p((d(),i("div",Nt,[t[15]||(t[15]=l("h4",null,"实时动态水印",-1)),t[16]||(t[16]=l("p",null,"水印内容会根据上方输入实时更新，包括文本、颜色和大小。",-1)),e(s,null,{default:a(()=>[e(G,null,{default:a(()=>[n("动态文本: "+N(o(f)),1)]),_:1}),e(G,{type:"info"},{default:a(()=>[n("更新次数: "+N(o(S)),1)]),_:1})]),_:1})])),[[u,{text:o(f),textColor:o(b),fontSize:o(k),onUpdate:I,onError:W}]])]),_:1}),e(C),e(y,{depth:"3"},{default:a(()=>[...t[17]||(t[17]=[n("支持响应式数据和回调函数",-1)])]),_:1})]),_:1}),e(x,{title:"应用场景演示",size:"small"},{default:a(()=>[e(T,{value:o(z),"onUpdate:value":t[3]||(t[3]=r=>g(z)?z.value=r:null),type:"line",size:"small"},{default:a(()=>[e(m,{name:"document",tab:"文档场景"},{default:a(()=>[p((d(),i("div",St,[t[21]||(t[21]=l("h4",null,"📄 重要文档",-1)),t[22]||(t[22]=l("p",null,[l("strong",null,"文档标题:"),n(" 年度工作总结报告")],-1)),l("p",null,[t[18]||(t[18]=l("strong",null,"创建时间:",-1)),n(" "+N(o($)),1)]),t[23]||(t[23]=l("p",null,[l("strong",null,"状态:"),n(" 草稿阶段")],-1)),t[24]||(t[24]=l("p",null,"这是一份重要的工作文档，包含敏感信息。文档上的水印表明这是草稿版本，未经授权不得传播。",-1)),e(s,null,{default:a(()=>[e(v,{size:"small"},{default:a(()=>[...t[19]||(t[19]=[n("编辑",-1)])]),_:1}),e(v,{size:"small",type:"primary"},{default:a(()=>[...t[20]||(t[20]=[n("保存",-1)])]),_:1})]),_:1})])),[[u,{text:"草稿",textColor:"rgba(255, 165, 0, 0.3)",fontSize:18,textXGap:200,textYGap:100}]])]),_:1}),e(m,{name:"image",tab:"图片预览"},{default:a(()=>[p((d(),i("div",Dt,[t[27]||(t[27]=l("h4",null,"🖼️ 图片预览",-1)),t[28]||(t[28]=l("div",{class:"image-container"},[l("div",{class:"placeholder-image"},[l("div",{class:"i-mdi:image-outline text-6xl text-gray-400"}),l("p",{class:"text-gray-500"},"预览图片区域")])],-1)),e(s,{class:"mt-4"},{default:a(()=>[e(v,{size:"small"},{default:a(()=>[...t[25]||(t[25]=[n("下载原图",-1)])]),_:1}),e(v,{size:"small",type:"primary"},{default:a(()=>[...t[26]||(t[26]=[n("购买授权",-1)])]),_:1})]),_:1})])),[[u,{text:"仅供预览",fontSize:24,rotate:45,textXGap:220,textYGap:120}]])]),_:1}),e(m,{name:"data",tab:"数据表格"},{default:a(()=>[p((d(),i("div",Gt,[t[31]||(t[31]=l("h4",null,"📊 数据报表",-1)),e(J,{data:o(ct),columns:o(bt),size:"small",pagination:!1},null,8,["data","columns"]),e(s,{class:"mt-4"},{default:a(()=>[e(v,{size:"small"},{default:a(()=>[...t[29]||(t[29]=[n("导出Excel",-1)])]),_:1}),e(v,{size:"small",type:"primary"},{default:a(()=>[...t[30]||(t[30]=[n("生成报告",-1)])]),_:1})]),_:1})])),[[u,{text:"内部数据",textColor:"rgba(220, 20, 60, 0.25)",fontSize:14,textXGap:200,textYGap:100}]])]),_:1})]),_:1},8,["value"]),e(C),e(y,{depth:"3"},{default:a(()=>[...t[32]||(t[32]=[n("不同业务场景下的水印应用示例",-1)])]),_:1})]),_:1})]),_:1})]),_:1}),e(E,null,{default:a(()=>[e(x,{title:"使用代码",size:"small"},{default:a(()=>[e(T,{value:o(c),"onUpdate:value":t[4]||(t[4]=r=>g(c)?c.value=r:null),type:"line",size:"small"},{default:a(()=>[e(m,{name:"basic",tab:"基础用法"},{default:a(()=>[e(w,{code:o(X),language:"html"},null,8,["code"])]),_:1}),e(m,{name:"style",tab:"样式配置"},{default:a(()=>[e(w,{code:o(B),language:"html"},null,8,["code"])]),_:1}),e(m,{name:"advanced",tab:"高级配置"},{default:a(()=>[e(w,{code:o(Y),language:"html"},null,8,["code"])]),_:1}),e(m,{name:"scenarios",tab:"应用场景"},{default:a(()=>[e(w,{code:o(L),language:"html"},null,8,["code"])]),_:1})]),_:1},8,["value"])]),_:1})]),_:1})]),_:1})])}}}),Yt=_t(Tt,[["__scopeId","data-v-2cc10d5f"]]);export{Yt as default};
