import X from"./index-CHAju3kL.js";import{r as M,e as Y,c as E,n as j,k as J,aM as Q,Q as z,R as d,S as t,U as s,j as n,V as i,K as r,F as I,N as V,_ as p,$ as b,Y as q,l as k,I as D}from"./vue-vendor-Bom1XEVO.js";import{aA as L,aO as Z,X as ee,U as se,L as te,J as ie,K as ne,S as oe,af as re,as as ae,P as le,W as ue,a1 as de,a0 as me,Y as ce}from"./ui-vendor-D9aA433m.js";import{_ as pe}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-C2dfl6FL.js";import"./spline-vendor-C3Tmx0e7.js";import"./charts-vendor-PiKWrtPe.js";import"./editor-vendor-CufumsHQ.js";const _e={1:{"user:view":!0,"user:edit":!0,"user:delete":!1,"system:admin":!1},2:{"user:view":!0,"user:edit":!0,"user:delete":!0,"system:admin":!1},3:{"user:*":!0,"system:*":!0},4:{"user:view":!0,"user:edit":!1,"user:delete":!1,"system:admin":!1},5:{}};function fe(){const _=M(1),o=Y([{id:1,name:"普通编辑员",desc:"可查看和编辑用户"},{id:2,name:"管理员",desc:"用户管理权限"},{id:3,name:"超级管理员",desc:"所有权限（通配符）"},{id:4,name:"只读用户",desc:"只能查看"},{id:5,name:"无权限用户",desc:"无任何权限"}]),m=E(()=>o.find(O=>O.id===_.value)||o[0]),N=E(()=>_e[_.value]||{});return{activeTab:M("basic"),currentUserId:_,currentUser:m,currentPermissions:N,userProfiles:o,operationCount:M(0)}}function ve(_){const o=L(),m=(a,l)=>{if(l[a])return!0;for(const c of Object.keys(l))if(c.endsWith("*")&&a.startsWith(c.slice(0,-1)))return l[c];return!1},N=(a,l,c)=>{const S=_.currentPermissions.value;m(a,S)?(_.operationCount.value++,o.success(`执行操作: ${l}`)):o.warning(`权限不足，无法执行"${l}"操作`)},O=(a,l,c="OR",S)=>{const B=_.currentPermissions.value,u=a.filter(f=>m(f,B));if(c==="AND"?u.length===a.length:u.length>0)_.operationCount.value++,o.success(`执行操作: ${l}`);else{const f=c==="AND"?"且":"或";o.warning(`权限不足，需要"${a.join(`"${f}"`)}权限才能执行"${l}"操作`)}};return{switchUser:async a=>{_.currentUserId.value=a,await j();const l=_.userProfiles.find(c=>c.id===a);o.info(`用户已切换: ${l?.name}`)},performSecureOperation:(a,l)=>{N(a,l)},performMultiSecureOperation:(a,l,c="OR")=>{O(a,l,c)},resetDemo:()=>{_.operationCount.value=0,o.info("演示状态已重置")}}}const $={basic:`<!-- 基础用法 -->
<NButton v-permission="{
  permissions: 'user:edit',
  authData: userPermissions
}" @click="handleEdit">
  编辑用户
</NButton>

<!-- 多权限检查 -->
<NButton v-permission="{
  permissions: ['user:edit', 'user:create'],
  authData: userPermissions,
  fallback: 'show'
}" @click="handleEditOrCreate">
  编辑或创建用户
</NButton>

<script setup>
const handleEdit = () => {
  // 在点击时再次检查权限并提示
  if (!hasPermission('user:edit')) {
    message.warning('权限不足，无法编辑用户')
    return
  }
  // 执行实际操作
  performOperation()
}
<\/script>`,advanced:`<!-- 高级配置 -->
<NButton v-permission="{
  permissions: 'user:delete',
  authData: userPermissions,
  fallback: 'disable'
}" @click="handleDelete">
  删除用户（禁用模式）
</NButton>

<!-- AND模式权限检查 -->
<NButton v-permission="{
  permissions: ['user:edit', 'user:delete'],
  authData: userPermissions,
  mode: 'AND',
  fallback: 'show'
}" @click="handleAdvancedOperation">
  高级操作（需要多权限）
</NButton>

<script setup>
const handleDelete = () => {
  if (!hasPermission('user:delete')) {
    message.warning('权限不足，无法删除用户')
    return
  }
  // 危险操作确认
  dialog.warning({
    title: '确认删除',
    content: '此操作不可恢复，确定要删除吗？',
    positiveText: '确定',
    onPositiveClick: () => {
      performDelete()
    }
  })
}
<\/script>`,scenarios:`<!-- 权限控制策略 -->

<!-- 1. 基础权限：没权限时隐藏 -->
<NButton v-permission="{
  permissions: 'user:view',
  authData: userPermissions,
  fallback: 'hide'
}" @click="performView">
  查看用户
</NButton>

<!-- 2. 危险操作：没权限时显示但禁用，点击提示 -->
<NButton v-permission="{
  permissions: 'user:delete',
  authData: userPermissions,
  fallback: 'show'
}" @click="performDelete">
  删除用户
</NButton>

<!-- 3. 管理功能：没权限时完全隐藏 -->
<div v-permission="{
  permissions: 'system:admin',
  authData: userPermissions,
  fallback: 'hide'
}">
  <NAlert type="warning">管理员面板</NAlert>
</div>

<!-- 4. 通配符权限 -->
<NButton v-permission="{
  permissions: 'user:*',
  authData: userPermissions
}" @click="performUserManagement">
  用户管理
</NButton>`},ge={class:"permission-demo-page"},ye={class:"user-option"},ke={class:"user-name"},be={class:"current-permissions"},Pe={class:"permission-list"},we={class:"demo-section"},Ne={class:"demo-row"},he={class:"button-container"},De={class:"permission-hint"},Oe={class:"status-indicator"},Ce={class:"demo-row"},Se={class:"button-container"},ze={class:"permission-hint"},Be={class:"status-indicator"},xe={class:"demo-row"},Ae={class:"button-container"},Me={class:"permission-hint"},$e={class:"status-indicator"},Te={class:"demo-row"},Ue={class:"button-container"},Re={class:"permission-hint"},Ee={class:"status-indicator"},Ie={class:"demo-section"},Ve={class:"strategy-row"},je={class:"strategy-row"},We={class:"strategy-row"},Ge={class:"demo-section"},He={class:"demo-row"},Ke={class:"button-container"},Fe={class:"permission-hint"},Xe={class:"status-indicator"},Ye={class:"demo-row"},Je={class:"button-container"},Qe={class:"permission-hint"},qe={class:"status-indicator"},Le={class:"demo-row"},Ze={class:"button-container"},es={class:"permission-hint"},ss={class:"status-indicator"},ts={class:"admin-panel"},is={class:"user-panel"},ns=J({__name:"index",setup(_){const o=fe(),m=ve(o),N=u=>{const e=o.currentPermissions.value;if(e[u])return!0;for(const f of Object.keys(e))if(f.endsWith("*")&&u.startsWith(f.slice(0,-1)))return e[f];return!1},O=(u,e)=>{const f=u.filter(v=>N(v));return e==="AND"?f.length===u.length:f.length>0},a=u=>N(u)?"status-granted":"status-denied",l=u=>N(u)?"✅ 有权限":"❌ 无权限",c=(u,e)=>O(u,e)?"status-granted":"status-denied",S=(u,e)=>O(u,e)?"✅ 有权限":"❌ 无权限",B=async u=>{await m.switchUser(u),await j()};return(u,e)=>{const f=Z,v=oe,W=ne,h=se,G=ie,H=re,P=ae,C=te,w=le,T=ue,U=ee,x=X,A=me,K=de,F=ce,g=Q("permission");return d(),z("div",ge,[t(f,null,{default:s(()=>[...e[11]||(e[11]=[n("v-permission 权限指令场景示例",-1)])]),_:1}),t(F,{cols:2,"x-gap":24,"y-gap":16},{default:s(()=>[t(U,null,{default:s(()=>[t(h,{vertical:"",size:"large"},{default:s(()=>[t(C,{title:"👤 用户角色切换",size:"small"},{default:s(()=>[t(h,{vertical:""},{default:s(()=>[t(G,{value:r(o).currentUserId.value,"onUpdate:value":[e[0]||(e[0]=y=>r(o).currentUserId.value=y),B]},{default:s(()=>[t(h,{vertical:""},{default:s(()=>[(d(!0),z(I,null,V(r(o).userProfiles,y=>(d(),p(W,{key:y.id,value:y.id,label:y.name},{default:s(()=>[i("div",ye,[i("span",ke,b(y.name),1),t(v,{size:"small",type:"info"},{default:s(()=>[n(b(y.desc),1)]),_:2},1024)])]),_:2},1032,["value","label"]))),128))]),_:1})]),_:1},8,["value"]),t(H),i("div",be,[t(P,{strong:""},{default:s(()=>[...e[12]||(e[12]=[n("当前用户权限:",-1)])]),_:1}),i("div",Pe,[(d(!0),z(I,null,V(r(o).currentPermissions.value,(y,R)=>(d(),p(v,{key:R,type:y?"success":"error",size:"small"},{default:s(()=>[n(b(R)+": "+b(y?"✓":"✗"),1)]),_:2},1032,["type"]))),128)),Object.keys(r(o).currentPermissions.value).length===0?(d(),p(v,{key:0,type:"warning",size:"small"},{default:s(()=>[...e[13]||(e[13]=[n(" 无权限 ",-1)])]),_:1})):q("",!0)])])]),_:1})]),_:1}),t(C,{title:"🔐 基础权限演示",size:"small"},{default:s(()=>[t(h,{vertical:""},{default:s(()=>[t(P,{depth:"3",style:{"margin-bottom":"8px"}},{default:s(()=>[...e[14]||(e[14]=[n(" 点击按钮体验权限控制，没权限时会给出提示 ",-1)])]),_:1}),i("div",we,[i("div",Ne,[i("div",he,[k((d(),p(w,{type:"primary",onClick:e[1]||(e[1]=()=>r(m).performSecureOperation("user:view","查看用户"))},{default:s(()=>[...e[15]||(e[15]=[n(" 👁️ 查看用户 ",-1)])]),_:1})),[[g,{permissions:"user:view",authData:r(o).currentPermissions.value,fallback:"hide"}]]),i("div",De,[t(v,{size:"tiny"},{default:s(()=>[...e[16]||(e[16]=[n("需要: user:view",-1)])]),_:1})])]),i("div",Oe,[i("span",{class:D(a("user:view"))},b(l("user:view")),3)])]),i("div",Ce,[i("div",Se,[k((d(),p(w,{type:"success",onClick:e[2]||(e[2]=()=>r(m).performSecureOperation("user:edit","编辑用户"))},{default:s(()=>[...e[17]||(e[17]=[n(" ✏️ 编辑用户 ",-1)])]),_:1})),[[g,{permissions:"user:edit",authData:r(o).currentPermissions.value,fallback:"show"}]]),i("div",ze,[t(v,{size:"tiny"},{default:s(()=>[...e[18]||(e[18]=[n("需要: user:edit (点击体验提示)",-1)])]),_:1})])]),i("div",Be,[i("span",{class:D(a("user:edit"))},b(l("user:edit")),3)])]),i("div",xe,[i("div",Ae,[k((d(),p(w,{type:"error",onClick:e[3]||(e[3]=()=>r(m).performSecureOperation("user:delete","删除用户"))},{default:s(()=>[...e[19]||(e[19]=[n(" 🗑️ 删除用户 ",-1)])]),_:1})),[[g,{permissions:"user:delete",authData:r(o).currentPermissions.value,fallback:"show"}]]),i("div",Me,[t(v,{size:"tiny"},{default:s(()=>[...e[20]||(e[20]=[n("需要: user:delete (点击体验提示)",-1)])]),_:1})])]),i("div",$e,[i("span",{class:D(a("user:delete"))},b(l("user:delete")),3)])]),i("div",Te,[i("div",Ue,[k((d(),p(w,{type:"warning",onClick:e[4]||(e[4]=()=>r(m).performSecureOperation("system:admin","系统管理"))},{default:s(()=>[...e[21]||(e[21]=[n(" ⚙️ 系统管理 ",-1)])]),_:1})),[[g,{permissions:"system:admin",authData:r(o).currentPermissions.value,fallback:"hide"}]]),i("div",Re,[t(v,{size:"tiny"},{default:s(()=>[...e[22]||(e[22]=[n("需要: system:admin (隐藏模式)",-1)])]),_:1})])]),i("div",Ee,[i("span",{class:D(a("system:admin"))},b(l("system:admin")),3)])])])]),_:1})]),_:1}),t(C,{title:"🎯 降级策略演示",size:"small"},{default:s(()=>[t(h,{vertical:""},{default:s(()=>[t(P,{depth:"3",style:{"margin-bottom":"8px"}},{default:s(()=>[...e[23]||(e[23]=[n(" 同一个权限，不同的处理方式 ",-1)])]),_:1}),i("div",Ie,[i("div",Ve,[t(P,{strong:""},{default:s(()=>[...e[24]||(e[24]=[n("隐藏模式 (fallback: 'hide'):",-1)])]),_:1}),k((d(),p(w,{type:"error"},{default:s(()=>[...e[25]||(e[25]=[n(" 🔒 隐藏按钮 ",-1)])]),_:1})),[[g,{permissions:"admin:secret",authData:r(o).currentPermissions.value,fallback:"hide"}]]),t(P,{depth:"3",size:"small"},{default:s(()=>[...e[26]||(e[26]=[n("没权限时完全隐藏",-1)])]),_:1})]),i("div",je,[t(P,{strong:""},{default:s(()=>[...e[27]||(e[27]=[n("禁用模式 (fallback: 'disable'):",-1)])]),_:1}),k((d(),p(w,{type:"warning",onClick:e[5]||(e[5]=()=>r(m).performSecureOperation("admin:secret","管理员操作"))},{default:s(()=>[...e[28]||(e[28]=[n(" 🚫 禁用按钮 ",-1)])]),_:1})),[[g,{permissions:"admin:secret",authData:r(o).currentPermissions.value,fallback:"disable"}]]),t(P,{depth:"3",size:"small"},{default:s(()=>[...e[29]||(e[29]=[n("没权限时禁用但可见",-1)])]),_:1})]),i("div",We,[t(P,{strong:""},{default:s(()=>[...e[30]||(e[30]=[n("显示模式 (fallback: 'show'):",-1)])]),_:1}),k((d(),p(w,{type:"info",onClick:e[6]||(e[6]=()=>r(m).performSecureOperation("admin:secret","管理员操作"))},{default:s(()=>[...e[31]||(e[31]=[n(" 👻 半透明按钮 ",-1)])]),_:1})),[[g,{permissions:"admin:secret",authData:r(o).currentPermissions.value,fallback:"show"}]]),t(P,{depth:"3",size:"small"},{default:s(()=>[...e[32]||(e[32]=[n("没权限时半透明，点击提示",-1)])]),_:1})])])]),_:1})]),_:1}),t(C,{title:"⚡ 高级配置演示",size:"small"},{default:s(()=>[t(h,{vertical:""},{default:s(()=>[i("div",Ge,[i("div",He,[i("div",Ke,[k((d(),p(w,{type:"primary",onClick:e[7]||(e[7]=()=>r(m).performMultiSecureOperation(["user:edit","user:delete"],"编辑或删除","OR"))},{default:s(()=>[...e[33]||(e[33]=[n(" 📝 编辑或删除 (OR模式) ",-1)])]),_:1})),[[g,{permissions:["user:edit","user:delete"],authData:r(o).currentPermissions.value,mode:"OR",fallback:"show"}]]),i("div",Fe,[t(v,{size:"tiny"},{default:s(()=>[...e[34]||(e[34]=[n("需要: user:edit 或 user:delete",-1)])]),_:1})])]),i("div",Xe,[i("span",{class:D(c(["user:edit","user:delete"],"OR"))},b(S(["user:edit","user:delete"],"OR")),3)])]),i("div",Ye,[i("div",Je,[k((d(),p(w,{type:"warning",onClick:e[8]||(e[8]=()=>r(m).performMultiSecureOperation(["user:edit","user:delete"],"编辑且删除","AND"))},{default:s(()=>[...e[35]||(e[35]=[n(" 🔒 编辑且删除 (AND模式) ",-1)])]),_:1})),[[g,{permissions:["user:edit","user:delete"],authData:r(o).currentPermissions.value,mode:"AND",fallback:"show"}]]),i("div",Qe,[t(v,{size:"tiny"},{default:s(()=>[...e[36]||(e[36]=[n("需要: user:edit 且 user:delete",-1)])]),_:1})])]),i("div",qe,[i("span",{class:D(c(["user:edit","user:delete"],"AND"))},b(S(["user:edit","user:delete"],"AND")),3)])]),i("div",Le,[i("div",Ze,[k((d(),p(w,{type:"success",onClick:e[9]||(e[9]=()=>r(m).performSecureOperation("user:*","用户管理"))},{default:s(()=>[...e[37]||(e[37]=[n(" 🌟 通配符权限 (user:*) ",-1)])]),_:1})),[[g,{permissions:"user:*",authData:r(o).currentPermissions.value,fallback:"show"}]]),i("div",es,[t(v,{size:"tiny"},{default:s(()=>[...e[38]||(e[38]=[n("需要: user:* 通配符权限",-1)])]),_:1})])]),i("div",ss,[i("span",{class:D(a("user:*"))},b(l("user:*")),3)])])])]),_:1})]),_:1}),t(C,{title:"📋 面板权限演示",size:"small"},{default:s(()=>[t(h,{vertical:""},{default:s(()=>[k((d(),z("div",ts,[t(T,{type:"error",title:"超级管理员面板"},{default:s(()=>[...e[39]||(e[39]=[n(" 只有超级管理员才能看到此面板内容 ",-1)])]),_:1})])),[[g,{permissions:"system:admin",authData:r(o).currentPermissions.value,fallback:"hide"}]]),k((d(),z("div",is,[t(T,{type:"info",title:"用户面板"},{default:s(()=>[...e[40]||(e[40]=[n(" 有用户查看权限才能正常使用此面板 ",-1)])]),_:1})])),[[g,{permissions:"user:view",authData:r(o).currentPermissions.value,fallback:"show"}]]),t(P,{depth:"3",size:"small"},{default:s(()=>[...e[41]||(e[41]=[n(" 上方面板会根据权限动态显示/隐藏 ",-1)])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}),t(U,null,{default:s(()=>[t(C,{title:"📝 使用示例",size:"small"},{default:s(()=>[t(K,{value:r(o).activeTab.value,"onUpdate:value":e[10]||(e[10]=y=>r(o).activeTab.value=y),type:"line",size:"small"},{default:s(()=>[t(A,{name:"basic",tab:"基础用法"},{default:s(()=>[t(x,{code:r($).basic,language:"html"},null,8,["code"])]),_:1}),t(A,{name:"advanced",tab:"高级配置"},{default:s(()=>[t(x,{code:r($).advanced,language:"html"},null,8,["code"])]),_:1}),t(A,{name:"scenarios",tab:"应用场景"},{default:s(()=>[t(x,{code:r($).scenarios,language:"html"},null,8,["code"])]),_:1})]),_:1},8,["value"])]),_:1})]),_:1})]),_:1})])}}}),ps=pe(ns,[["__scopeId","data-v-2f898abd"]]);export{ps as default};
