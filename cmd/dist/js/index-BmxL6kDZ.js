import nt from"./index-BEgtnFVO.js";import{e as X,k as at,r as _,ar as lt,P as i,Q as d,R as e,S as o,j as l,U as s,l as p,a2 as C,J as a,Z as st,X as dt,_ as r,F as T,M as U,L,H as it}from"./vue-vendor-DgJqRHrX.js";import{aJ as rt,a4 as ct,K as ut,X as pt,ae as _t,at as vt,U as gt,af as mt,a2 as ft,L as bt,a9 as xt,a8 as yt,M as ht,a5 as Ct}from"./ui-vendor-Dblj447Y.js";import{_ as kt}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-DAKaZtA3.js";import"./spline-vendor-Btm54g1Q.js";import"./charts-vendor-DjXuxi75.js";import"./editor-vendor-BwkH8h9-.js";function St(){return`<!-- 启用拖拽 -->
<div v-drag="true">
  <p>可以拖拽的元素</p>
</div>

<!-- 使用默认配置 -->
<div v-drag>
  <p>默认拖拽配置</p>
</div>

<!-- 禁用拖拽 -->
<div v-drag="false">
  <p>禁用拖拽的元素</p>
</div>`}function Nt(){return`<!-- 指定拖拽手柄 -->
<div v-drag="{
  handle: '.drag-handle'
}">
  <div class="drag-handle">拖拽手柄</div>
  <p>内容区域</p>
</div>

<!-- 边界限制和轴限制 -->
<div v-drag="{
  boundary: '.container',
  axis: 'x'
}">
  <p>只能在X轴拖拽</p>
</div>

<!-- 网格对齐 -->
<div v-drag="{
  grid: [20, 20],
  cursor: 'crosshair'
}">
  <p>网格对齐拖拽</p>
</div>`}function zt(){return`<script setup>
// 拖拽配置
const dragEnabled = ref(true)
const dragAxis = ref('both')

// 回调函数
const handleDragStart = (el, event) => {
  console.log('开始拖拽:', el)
}

const handleDragMove = (el, event, position) => {
  console.log('拖拽中:', position)
}

const handleDragEnd = (el, event, position) => {
  console.log('拖拽结束:', position)
}
<\/script>

<!-- 动态配置 -->
<div v-drag="{
  disabled: !dragEnabled,
  axis: dragAxis,
  threshold: 5,
  onStart: handleDragStart,
  onDrag: handleDragMove,
  onEnd: handleDragEnd
}">
  <p>动态配置拖拽</p>
</div>`}function Dt(){return`<!-- 卡片拖拽 -->
<div v-drag="{
  boundary: '.container',
  onEnd: updateCardPosition
}" class="card">
  <h3>拖拽卡片</h3>
  <p>卡片内容...</p>
</div>

<!-- 列表排序 -->
<div v-for="item in list"
     v-drag="{
       axis: 'y',
       grid: [1, 60]
     }"
     class="list-item">
  {{ item.name }}
</div>

<!-- 画布元素 -->
<div v-for="shape in shapes"
     v-drag="{
       boundary: '.canvas',
       onDrag: updateShapePosition
     }"
     class="shape">
  {{ shape.label }}
</div>`}const wt=[{label:"全方向",value:"both"},{label:"仅X轴",value:"x"},{label:"仅Y轴",value:"y"}],Et=X([{id:1,title:"项目计划",content:"制定详细的项目开发计划和时间表",color:"#ff6b6b"},{id:2,title:"需求分析",content:"分析用户需求和功能规格说明",color:"#4ecdc4"},{id:3,title:"技术选型",content:"确定技术栈和开发工具",color:"#45b7d1"}]),Mt=X([{id:1,name:"首页设计",description:"设计首页布局和交互效果"},{id:2,name:"用户登录",description:"实现用户注册和登录功能"},{id:3,name:"数据管理",description:"建立数据库和数据管理系统"},{id:4,name:"接口开发",description:"开发前后端交互接口"},{id:5,name:"测试部署",description:"进行功能测试和系统部署"}]),E=X([{id:1,type:"circle",label:"圆形",x:50,y:50,color:"#ff6b6b"},{id:2,type:"square",label:"方形",x:150,y:100,color:"#4ecdc4"},{id:3,type:"circle",label:"圆形",x:100,y:150,color:"#45b7d1"}]),$t={class:"drag-demo-page"},Bt={class:"demo-container"},Pt={class:"drag-box",style:{left:"20px",top:"20px","background-color":"#18a058",color:"white"}},Tt={class:"drag-box",style:{left:"160px",top:"20px","background-color":"#2080f0",color:"white"}},Ut={class:"demo-container"},Lt={class:"drag-box",style:{left:"20px",top:"20px","background-color":"#f0a020",color:"white"}},Xt={class:"drag-box",style:{left:"180px",top:"20px","background-color":"#d03050",color:"white"}},At={class:"drag-box",style:{left:"20px",top:"120px","background-color":"#7c3aed",color:"white"}},It={class:"demo-container"},Vt={class:"drag-box",style:{left:"20px",top:"20px","background-color":"#059669",color:"white"}},qt={class:"demo-container cards-container"},Ht={class:"card-actions"},jt={class:"demo-container list-container"},Ft={style:{flex:"1"}},Gt={style:{"font-weight":"500"}},Jt={style:{"font-size":"12px",color:"#999"}},Rt={style:{width:"24px",height:"24px","border-radius":"50%",background:"#f0f0f0",display:"flex","align-items":"center","justify-content":"center","font-size":"12px"}},Kt={class:"demo-container canvas-container"},Ot={class:"canvas-toolbar"},Qt=at({__name:"index",setup(H){const k=_("basic"),M=_("cards"),S=_(!0),N=_("both"),f=_(10),$=_("待拖拽"),A=_(0),b=_(null),j=c=>{$.value="拖拽中"},F=(c,t)=>{b.value=t},G=(c,t)=>{$.value="拖拽完成",A.value++,b.value=t},J=(c,t)=>{},R=(c,t)=>{const v=E.find(m=>m.id===c);v&&(v.x=t.x,v.y=t.y)},I=c=>{const t=["#ff6b6b","#4ecdc4","#45b7d1","#96ceb4","#feca57"],v={id:Date.now(),type:c,label:c==="circle"?"圆":"方",x:Math.random()*200+50,y:Math.random()*150+50,color:t[Math.floor(Math.random()*t.length)]};E.push(v)},K=()=>{E.splice(0)},O=St(),Q=Nt(),Y=zt(),Z=Dt();return(c,t)=>{const v=rt,m=_t,x=vt,y=pt,W=gt,tt=mt,et=ft,z=ut,B=bt,h=ht,g=yt,V=xt,q=ct,D=nt,ot=Ct,u=lt("drag");return d(),i("div",$t,[e(v,null,{default:o(()=>[...t[7]||(t[7]=[l("v-drag 拖拽指令场景示例",-1)])]),_:1}),e(ot,{cols:2,"x-gap":24,"y-gap":16},{default:o(()=>[e(q,null,{default:o(()=>[e(z,{vertical:"",size:"large"},{default:o(()=>[e(y,{title:"基础拖拽演示",size:"small"},{default:o(()=>[s("div",Bt,[p((d(),i("div",Pt,[...t[8]||(t[8]=[l(" 基础拖拽 ",-1)])])),[[u,!0]]),p((d(),i("div",Tt,[...t[9]||(t[9]=[l(" 默认配置 ",-1)])])),[[u]])]),e(m),e(x,{depth:"3"},{default:o(()=>[...t[10]||(t[10]=[l("最简单的使用方式，支持布尔值和默认配置",-1)])]),_:1})]),_:1}),e(y,{title:"样式自定义演示",size:"small"},{default:o(()=>[s("div",Ut,[p((d(),i("div",Lt,[...t[11]||(t[11]=[s("div",{class:"drag-handle",style:{position:"absolute",top:"5px",right:"5px",padding:"4px",cursor:"grab",background:"rgba(255, 255, 255, 0.2)","border-radius":"4px"}}," ⋮⋮ ",-1),l(" 拖拽手柄 ",-1)])])),[[u,{handle:".drag-handle"}]]),p((d(),i("div",Xt,[...t[12]||(t[12]=[l(" X轴拖拽 ",-1)])])),[[u,{boundary:".demo-container",axis:"x"}]]),p((d(),i("div",At,[...t[13]||(t[13]=[l(" 网格对齐 ",-1)])])),[[u,{grid:[20,20]}]])]),e(m),e(x,{depth:"3"},{default:o(()=>[...t[14]||(t[14]=[l("支持拖拽手柄、边界限制、轴限制、网格对齐等配置",-1)])]),_:1})]),_:1}),e(y,{title:"动态内容演示",size:"small"},{default:o(()=>[e(z,null,{default:o(()=>[e(W,{value:a(S),"onUpdate:value":t[0]||(t[0]=n=>C(S)?S.value=n:null)},null,8,["value"]),e(x,null,{default:o(()=>[...t[15]||(t[15]=[l("启用拖拽",-1)])]),_:1}),e(tt,{value:a(N),"onUpdate:value":t[1]||(t[1]=n=>C(N)?N.value=n:null),options:a(wt),style:{width:"120px"},class:"mt--6px"},null,8,["value","options"]),e(et,{value:a(f),"onUpdate:value":t[2]||(t[2]=n=>C(f)?f.value=n:null),min:1,max:50,placeholder:"网格大小",style:{width:"120px"},class:"mt--6px"},null,8,["value"])]),_:1}),s("div",It,[p((d(),i("div",Vt,[...t[16]||(t[16]=[l(" 动态配置 ",-1)])])),[[u,{disabled:!a(S),axis:a(N),grid:[a(f),a(f)],onStart:j,onDrag:F,onEnd:G}]])]),e(z,null,{default:o(()=>[e(B,null,{default:o(()=>[l("拖拽状态: "+r(a($)),1)]),_:1}),e(B,{type:"info"},{default:o(()=>[l("拖拽次数: "+r(a(A)),1)]),_:1}),a(b)?(d(),st(B,{key:0,type:"success"},{default:o(()=>[l(" 位置: ("+r(Math.round(a(b).x))+", "+r(Math.round(a(b).y))+") ",1)]),_:1})):dt("",!0)]),_:1}),e(m),e(x,{depth:"3"},{default:o(()=>[...t[17]||(t[17]=[l("支持响应式配置和回调函数",-1)])]),_:1})]),_:1}),e(y,{title:"应用场景演示",size:"small"},{default:o(()=>[e(V,{value:a(M),"onUpdate:value":t[5]||(t[5]=n=>C(M)?M.value=n:null),type:"line",size:"small"},{default:o(()=>[e(g,{name:"cards",tab:"卡片拖拽"},{default:o(()=>[s("div",qt,[(d(!0),i(T,null,U(a(Et),n=>p((d(),i("div",{key:n.id,class:"drag-card",style:L({backgroundColor:n.color})},[s("h4",null,r(n.title),1),s("p",null,r(n.content),1),s("div",Ht,[e(h,{size:"tiny"},{default:o(()=>[...t[18]||(t[18]=[l("编辑",-1)])]),_:1}),e(h,{size:"tiny",type:"primary"},{default:o(()=>[...t[19]||(t[19]=[l("查看",-1)])]),_:1})])],4)),[[u,{boundary:".cards-container",onEnd:(w,P)=>J(n.id,P)}]])),128))])]),_:1}),e(g,{name:"list",tab:"列表排序"},{default:o(()=>[s("div",jt,[(d(!0),i(T,null,U(a(Mt),(n,w)=>p((d(),i("div",{key:n.id,class:"drag-list-item",style:L({left:"0px",top:w*70+10+"px",backgroundColor:"#fff"})},[t[20]||(t[20]=s("div",{style:{"margin-right":"12px",color:"#999"}},"⋮⋮",-1)),s("div",Ft,[s("div",Gt,r(n.name),1),s("div",Jt,r(n.description),1)]),s("div",Rt,r(w+1),1)],4)),[[u,{axis:"y",boundary:".list-container",grid:[1,70]}]])),128))])]),_:1}),e(g,{name:"canvas",tab:"画布元素"},{default:o(()=>[s("div",Kt,[(d(!0),i(T,null,U(a(E),n=>p((d(),i("div",{key:n.id,class:it(["canvas-shape",n.type]),style:L({left:n.x+"px",top:n.y+"px",backgroundColor:n.color})},[s("span",null,r(n.label),1)],6)),[[u,{boundary:".canvas-container",onDrag:(w,P)=>R(n.id,P)}]])),128)),s("div",Ot,[e(z,null,{default:o(()=>[e(h,{size:"small",onClick:t[3]||(t[3]=n=>I("circle"))},{default:o(()=>[...t[21]||(t[21]=[s("div",{class:"i-mdi:circle"},null,-1),l(" 圆形 ",-1)])]),_:1}),e(h,{size:"small",onClick:t[4]||(t[4]=n=>I("square"))},{default:o(()=>[...t[22]||(t[22]=[s("div",{class:"i-mdi:square"},null,-1),l(" 方形 ",-1)])]),_:1}),e(h,{size:"small",onClick:K},{default:o(()=>[...t[23]||(t[23]=[l("清空",-1)])]),_:1})]),_:1})])])]),_:1})]),_:1},8,["value"]),e(m),e(x,{depth:"3"},{default:o(()=>[...t[24]||(t[24]=[l("不同业务场景下的拖拽应用示例",-1)])]),_:1})]),_:1})]),_:1})]),_:1}),e(q,null,{default:o(()=>[e(y,{title:"使用代码",size:"small"},{default:o(()=>[e(V,{value:a(k),"onUpdate:value":t[6]||(t[6]=n=>C(k)?k.value=n:null),type:"line",size:"small"},{default:o(()=>[e(g,{name:"basic",tab:"基础用法"},{default:o(()=>[e(D,{code:a(O),language:"html"},null,8,["code"])]),_:1}),e(g,{name:"style",tab:"样式配置"},{default:o(()=>[e(D,{code:a(Q),language:"html"},null,8,["code"])]),_:1}),e(g,{name:"advanced",tab:"高级配置"},{default:o(()=>[e(D,{code:a(Y),language:"html"},null,8,["code"])]),_:1}),e(g,{name:"scenarios",tab:"应用场景"},{default:o(()=>[e(D,{code:a(Z),language:"html"},null,8,["code"])]),_:1})]),_:1},8,["value"])]),_:1})]),_:1})]),_:1})])}}}),le=kt(Qt,[["__scopeId","data-v-e87ea0f7"]]);export{le as default};
