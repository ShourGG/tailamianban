import C from"./index-CHAju3kL.js";import I from"./index-DP8QyUpt.js";import z from"./IconCommunity-CmswN8Tm.js";import x from"./IconDocumentation-DY8m2Qqa.js";import{aO as S}from"./ui-vendor-D9aA433m.js";import{k as T,r as p,c as L,Q as l,R as c,V as n,S as d,U as V,j as P,F as u,N as b,$ as g,I as w,Y as H,s as N,K as U}from"./vue-vendor-Bom1XEVO.js";import{_ as j}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-C2dfl6FL.js";import"./spline-vendor-C3Tmx0e7.js";import"./charts-vendor-PiKWrtPe.js";import"./editor-vendor-CufumsHQ.js";import"./iconify-W0kOH8CK.js";import"./index-Chx56wke.js";const k={check:"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",cross:"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"},i={iconify:`<!-- 基础用法 -->
<C_Icon name="mdi:home" />

<!-- 自定义大小和颜色 -->
<C_Icon name="mdi:settings" size="24" />
<C_Icon name="material-symbols:favorite" color="red" size="32" />

<!-- 可点击交互 -->
<C_Icon name="lucide:star" clickable @click="handleClick" />`,unocss:`<!-- UnoCSS 图标需要指定 type -->
<C_Icon type="unocss" name="i-mdi-home" />
<C_Icon type="unocss" name="i-mdi-settings" size="24" />
<C_Icon type="unocss" name="i-mdi-user" color="#42b883" size="32" />

<!-- 支持交互 -->
<C_Icon type="unocss" name="i-mdi-heart" clickable @click="handleClick" />`,svg:`<!-- SVG 路径图标 -->
<C_Icon
  type="svg"
  name="custom-check"
  :svg-path="checkPath"
  color="green"
  size="24"
/>

<script setup>
const checkPath = "M9 16.17L4.83 12l-1.42 1.41L9 19..."
<\/script>`,component:`<!-- 组件方式图标 -->
<script setup>
import IconCommunity from '@/components/icons/IconCommunity.vue'
<\/script>

<C_Icon
  type="component"
  :name="IconCommunity"
  :component-props="{ width: 32, height: 32 }"
/>`,image:`<!-- 本地图片 - 自动使用 useImage -->
<C_Icon type="image" name="avatar" size="32" />
<C_Icon type="image" name="icons/home" size="32" />

<!-- 远程图片 - 直接使用 URL -->
<C_Icon
  type="image"
  name="https://cdn.jsdelivr.net/gh/devicons/..."
  size="32"
/>

<!-- 手动控制本地处理 -->
<C_Icon
  type="image"
  name="logo"
  :use-local-image="true"
  fallback-icon="mdi:image"
/>`,interactive:`<!-- 可点击图标 -->
<C_Icon name="mdi:thumb-up" clickable @click="handleLike" />

<!-- 加载状态 -->
<C_Icon name="mdi:loading" :loading="loading" clickable />

<!-- 旋转和翻转效果 -->
<C_Icon name="mdi:refresh" :rotate="rotation" clickable />
<C_Icon name="mdi:arrow-right" :flip="flipped ? 'horizontal' : undefined" />`,error:`<!-- 错误时显示 fallback 图标 -->
<C_Icon
  name="nonexistent:icon"
  fallback-icon="mdi:help-circle"
  @error="handleError"
/>

<C_Icon
  type="image"
  name="https://nonexistent.com/image.png"
  fallback-icon="mdi:image-broken"
  @error="handleError"
/>`,custom:`<!-- 自定义动画样式 -->
<C_Icon
  name="mdi:star"
  size="48"
  color="gold"
  custom-class="sparkle-icon"
/>

<style>
.sparkle-icon {
  animation: sparkle 2s ease-in-out infinite;
}
</style>`},D=(e,a,t)=>({click:()=>{},like:()=>{},toggleLoading:()=>{e.value=!e.value},rotate:()=>{a.value+=90,a.value>=360&&(a.value=0)},flip:()=>{t.value=!t.value}}),M=(e,a,t,r)=>[{id:"iconify",language:"html",title:"1. Iconify 图标（默认推荐）",badge:"primary",badgeText:"默认",icons:[{key:"home",props:{name:"mdi:home"},label:"mdi:home"},{key:"settings",props:{name:"mdi:settings",size:"24"},label:'size="24"'},{key:"favorite",props:{name:"material-symbols:favorite",color:"red",size:"32"},label:'color="red"'},{key:"star",props:{name:"lucide:star",clickable:!0},label:"可点击",handler:e.click}],code:i.iconify},{id:"unocss",language:"html",title:"2. UnoCSS 图标",badge:"secondary",badgeText:"静态",icons:[{key:"home",props:{type:"unocss",name:"i-mdi:home-assistant"},label:"i-mdi-home"},{key:"settings",props:{type:"unocss",name:"i-mdi:account-multiple-check-outline",size:"24"},label:'size="24"'},{key:"user",props:{type:"unocss",name:"i-mdi:user-group",color:"#42b883",size:"32"},label:'color="#42b883"'},{key:"heart",props:{type:"unocss",name:"i-mdi:ev-plug-chademo",clickable:!0},label:"可点击",handler:e.click}],code:i.unocss},{id:"svg",language:"html",title:"3. SVG 路径图标",badge:"warning",badgeText:"自定义",icons:[{key:"check",props:{type:"svg",name:"custom-check",svgPath:k.check,color:"green",size:"24"},label:"✓ 成功"},{key:"cross",props:{type:"svg",name:"custom-cross",svgPath:k.cross,color:"red",size:"24"},label:"✗ 错误"}],code:i.svg},{id:"component",language:"html",title:"4. 组件图标",badge:"info",badgeText:"组件",icons:[{key:"community",props:{type:"component",name:z,componentProps:{width:32,height:32}},label:"IconCommunity"},{key:"docs",props:{type:"component",name:x,componentProps:{color:"gold",size:32}},label:"IconDocumentation"}],code:i.component,note:"<strong>注意：</strong>组件方式需要确保对应的图标组件已正确导入和注册"},{id:"image",language:"html",title:"5. 图片图标（集成 useImage）",badge:"success",badgeText:"智能",icons:[{key:"avatar",props:{type:"image",name:"avatar",size:"32",alt:"头像"},label:"本地: avatar"},{key:"home-icon",props:{type:"image",name:"icons/home",size:"32",alt:"首页图标"},label:"本地: icons/home"},{key:"vue-cdn",props:{type:"image",name:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",size:"32",alt:"Vue Logo"},label:"远程: Vue CDN"},{key:"logo-local",props:{type:"image",name:"robot",size:"32",fallbackIcon:"mdi:image"},label:"本地: robot"}],code:i.image,note:"<strong>图片处理说明：</strong><br>• 本地图片：自动使用 useImage hook 处理<br>• 远程图片：HTTP/HTTPS URL 直接使用<br>• 手动控制：use-local-image 属性强制指定处理方式"},{id:"interactive",language:"html",title:"6. 交互式功能",badge:"purple",badgeText:"交互",icons:[{key:"like",props:{name:"mdi:thumb-up",clickable:!0,size:"32",title:"点赞"},label:"可点击",handler:e.like},{key:"loading",props:{name:"mdi:loading",loading:a.value,size:"32",clickable:!0,title:"切换加载状态"},label:"加载状态",handler:e.toggleLoading},{key:"rotate",props:{name:"mdi:refresh",rotate:t.value,size:"32",clickable:!0,title:"旋转图标"},label:()=>`旋转: ${t.value}°`,handler:e.rotate},{key:"flip",props:{name:"mdi:arrow-right",flip:r.value?"horizontal":void 0,size:"32",clickable:!0,title:"翻转图标"},label:()=>r.value?"已翻转":"正常",handler:e.flip}],code:i.interactive},{id:"error",language:"html",title:"7. 错误处理",badge:"danger",badgeText:"容错",icons:[{key:"nonexistent",props:{name:"nonexistent:icon",fallbackIcon:"mdi:help-circle"},label:"不存在的图标"},{key:"broken-image",props:{type:"image",name:"https://nonexistent.com/image.png",fallbackIcon:"mdi:image-broken"},label:"错误的图片"},{key:"local-error",props:{type:"image",name:"nonexistent-local",fallbackIcon:"mdi:image-off"},label:"本地图片错误"}],code:i.error,note:"<strong>错误处理机制：</strong><br>• 自动显示 fallback-icon 作为备用图标<br>• 触发 error 事件供业务逻辑处理<br>• 支持 Iconify 和 UnoCSS 格式的 fallback"},{id:"custom",language:"html",title:"8. 自定义样式",badge:"warning",badgeText:"样式",icons:[{key:"sparkle",props:{name:"mdi:star",size:"48",color:"gold",customClass:"sparkle-icon"},label:"闪烁动画"},{key:"pulse",props:{name:"mdi:heart",size:"48",color:"red",customClass:"pulse-icon"},label:"脉冲动画"}],code:i.custom}],E={class:"demo-container"},G={class:"demo-header"},B={class:"section-title"},R={class:"demo-content"},$={class:"demo-preview"},F={class:"icon-list"},A=["innerHTML"],K=T({__name:"index",setup(e){const a=p(!1),t=p(0),r=p(!1),h=D(a,t,r),y=L(()=>M(h,a,t,r));return(O,m)=>{const _=S,f=I,v=C;return c(),l("div",E,[n("div",G,[d(_,null,{default:V(()=>[...m[0]||(m[0]=[P("图标组件场景示例",-1)])]),_:1}),m[1]||(m[1]=n("p",null,"支持 Iconify、UnoCSS、组件、SVG、图片等多种图标类型，默认使用 Iconify 提供动态能力",-1))]),(c(!0),l(u,null,b(U(y),o=>(c(),l("section",{key:o.id,class:"demo-section"},[n("div",B,[n("h2",null,g(o.title),1),n("span",{class:w(`badge badge-${o.badge}`)},g(o.badgeText),3)]),n("div",R,[n("div",$,[n("div",F,[(c(!0),l(u,null,b(o.icons,s=>(c(),l("div",{key:s.key,class:"icon-item"},[d(f,N({ref_for:!0},s.props,{onClick:s.handler}),null,16,["onClick"]),n("span",null,g(typeof s.label=="function"?s.label():s.label),1)]))),128))])]),d(v,{language:o.language,code:o.code,"show-header":!1,"max-height":200},null,8,["language","code"]),o.note?(c(),l("div",{key:0,class:"note",innerHTML:o.note},null,8,A)):H("",!0)])]))),128))])}}}),se=j(K,[["__scopeId","data-v-82bcbd9b"]]);export{se as default};
