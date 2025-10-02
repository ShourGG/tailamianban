import J from"./index-D3FXZR8f.js";import{r as M,e as K,c as E,n as j,k as Q,ar as Z,P as z,Q as d,R as t,S as s,j as n,U as i,J as r,F as I,M as V,Z as p,_ as b,X as q,l as k,H as D}from"./vue-vendor-DgJqRHrX.js";import{H as L,aJ as Y,a4 as ee,K as se,X as te,V as ie,W as ne,L as oe,ae as re,at as ae,M as le,a3 as ue,a9 as de,a8 as me,a5 as ce}from"./ui-vendor-Dblj447Y.js";import{_ as pe}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-2I1Ii_0g.js";import"./spline-vendor-Btm54g1Q.js";import"./charts-vendor-DjXuxi75.js";import"./editor-vendor-BwkH8h9-.js";const _e={1:{"user:view":!0,"user:edit":!0,"user:delete":!1,"system:admin":!1},2:{"user:view":!0,"user:edit":!0,"user:delete":!0,"system:admin":!1},3:{"user:*":!0,"system:*":!0},4:{"user:view":!0,"user:edit":!1,"user:delete":!1,"system:admin":!1},5:{}};function fe(){const _=M(1),o=K([{id:1,name:"普通编辑员",desc:"可查看和编辑用户"},{id:2,name:"管理员",desc:"用户管理权限"},{id:3,name:"超级管理员",desc:"所有权限（通配符）"},{id:4,name:"只读用户",desc:"只能查看"},{id:5,name:"无权限用户",desc:"无任何权限"}]),m=E(()=>o.find(O=>O.id===_.value)||o[0]),h=E(()=>_e[_.value]||{});return{activeTab:M("basic"),currentUserId:_,currentUser:m,currentPermissions:h,userProfiles:o,operationCount:M(0)}}function ve(_){const o=L(),m=(a,l)=>{if(l[a])return!0;for(const c of Object.keys(l))if(c.endsWith("*")&&a.startsWith(c.slice(0,-1)))return l[c];return!1},h=(a,l,c)=>{const S=_.currentPermissions.value;m(a,S)?(_.operationCount.value++,o.success(`执行操作: ${l}`)):o.warning(`权限不足，无法执行"${l}"操作`)},O=(a,l,c="OR",S)=>{const B=_.currentPermissions.value,u=a.filter(f=>m(f,B));if(c==="AND"?u.length===a.length:u.length>0)_.operationCount.value++,o.success(`执行操作: ${l}`);else{const f=c==="AND"?"且":"或";o.warning(`权限不足，需要"${a.join(`"${f}"`)}权限才能执行"${l}"操作`)}};return{switchUser:async a=>{_.currentUserId.value=a,await j();const l=_.userProfiles.find(c=>c.id===a);o.info(`用户已切换: ${l?.name}`)},performSecureOperation:(a,l)=>{h(a,l)},performMultiSecureOperation:(a,l,c="OR")=>{O(a,l,c)},resetDemo:()=>{_.operationCount.value=0,o.info("演示状态已重置")}}}const T={basic:`<!-- 基础用法 -->
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
</NButton>`},ge={class:"permission-demo-page"},ye={class:"user-option"},ke={class:"user-name"},be={class:"current-permissions"},Pe={class:"permission-list"},we={class:"demo-section"},he={class:"demo-row"},Ne={class:"button-container"},De={class:"permission-hint"},Oe={class:"status-indicator"},Ce={class:"demo-row"},Se={class:"button-container"},ze={class:"permission-hint"},Be={class:"status-indicator"},xe={class:"demo-row"},Ae={class:"button-container"},Me={class:"permission-hint"},Te={class:"status-indicator"},$e={class:"demo-row"},Re={class:"button-container"},Ue={class:"permission-hint"},Ee={class:"status-indicator"},Ie={class:"demo-section"},Ve={class:"strategy-row"},je={class:"strategy-row"},He={class:"strategy-row"},We={class:"demo-section"},Ge={class:"demo-row"},Xe={class:"button-container"},Fe={class:"permission-hint"},Je={class:"status-indicator"},Ke={class:"demo-row"},Qe={class:"button-container"},Ze={class:"permission-hint"},qe={class:"status-indicator"},Le={class:"demo-row"},Ye={class:"button-container"},es={class:"permission-hint"},ss={class:"status-indicator"},ts={class:"admin-panel"},is={class:"user-panel"},ns=Q({__name:"index",setup(_){const o=fe(),m=ve(o),h=u=>{const e=o.currentPermissions.value;if(e[u])return!0;for(const f of Object.keys(e))if(f.endsWith("*")&&u.startsWith(f.slice(0,-1)))return e[f];return!1},O=(u,e)=>{const f=u.filter(v=>h(v));return e==="AND"?f.length===u.length:f.length>0},a=u=>h(u)?"status-granted":"status-denied",l=u=>h(u)?"✅ 有权限":"❌ 无权限",c=(u,e)=>O(u,e)?"status-granted":"status-denied",S=(u,e)=>O(u,e)?"✅ 有权限":"❌ 无权限",B=async u=>{await m.switchUser(u),await j()};return(u,e)=>{const f=Y,v=oe,H=ne,N=se,W=ie,G=re,P=ae,C=te,w=le,$=ue,R=ee,x=J,A=me,X=de,F=ce,g=Z("permission");return d(),z("div",ge,[t(f,null,{default:s(()=>[...e[11]||(e[11]=[n("v-permission 权限指令场景示例",-1)])]),_:1}),t(F,{cols:2,"x-gap":24,"y-gap":16},{default:s(()=>[t(R,null,{default:s(()=>[t(N,{vertical:"",size:"large"},{default:s(()=>[t(C,{title:"👤 用户角色切换",size:"small"},{default:s(()=>[t(N,{vertical:""},{default:s(()=>[t(W,{value:r(o).currentUserId.value,"onUpdate:value":[e[0]||(e[0]=y=>r(o).currentUserId.value=y),B]},{default:s(()=>[t(N,{vertical:""},{default:s(()=>[(d(!0),z(I,null,V(r(o).userProfiles,y=>(d(),p(H,{key:y.id,value:y.id,label:y.name},{default:s(()=>[i("div",ye,[i("span",ke,b(y.name),1),t(v,{size:"small",type:"info"},{default:s(()=>[n(b(y.desc),1)]),_:2},1024)])]),_:2},1032,["value","label"]))),128))]),_:1})]),_:1},8,["value"]),t(G),i("div",be,[t(P,{strong:""},{default:s(()=>[...e[12]||(e[12]=[n("当前用户权限:",-1)])]),_:1}),i("div",Pe,[(d(!0),z(I,null,V(r(o).currentPermissions.value,(y,U)=>(d(),p(v,{key:U,type:y?"success":"error",size:"small"},{default:s(()=>[n(b(U)+": "+b(y?"✓":"✗"),1)]),_:2},1032,["type"]))),128)),Object.keys(r(o).currentPermissions.value).length===0?(d(),p(v,{key:0,type:"warning",size:"small"},{default:s(()=>[...e[13]||(e[13]=[n(" 无权限 ",-1)])]),_:1})):q("",!0)])])]),_:1})]),_:1}),t(C,{title:"🔐 基础权限演示",size:"small"},{default:s(()=>[t(N,{vertical:""},{default:s(()=>[t(P,{depth:"3",style:{"margin-bottom":"8px"}},{default:s(()=>[...e[14]||(e[14]=[n(" 点击按钮体验权限控制，没权限时会给出提示 ",-1)])]),_:1}),i("div",we,[i("div",he,[i("div",Ne,[k((d(),p(w,{type:"primary",onClick:e[1]||(e[1]=()=>r(m).performSecureOperation("user:view","查看用户"))},{default:s(()=>[...e[15]||(e[15]=[n(" 👁️ 查看用户 ",-1)])]),_:1})),[[g,{permissions:"user:view",authData:r(o).currentPermissions.value,fallback:"hide"}]]),i("div",De,[t(v,{size:"tiny"},{default:s(()=>[...e[16]||(e[16]=[n("需要: user:view",-1)])]),_:1})])]),i("div",Oe,[i("span",{class:D(a("user:view"))},b(l("user:view")),3)])]),i("div",Ce,[i("div",Se,[k((d(),p(w,{type:"success",onClick:e[2]||(e[2]=()=>r(m).performSecureOperation("user:edit","编辑用户"))},{default:s(()=>[...e[17]||(e[17]=[n(" ✏️ 编辑用户 ",-1)])]),_:1})),[[g,{permissions:"user:edit",authData:r(o).currentPermissions.value,fallback:"show"}]]),i("div",ze,[t(v,{size:"tiny"},{default:s(()=>[...e[18]||(e[18]=[n("需要: user:edit (点击体验提示)",-1)])]),_:1})])]),i("div",Be,[i("span",{class:D(a("user:edit"))},b(l("user:edit")),3)])]),i("div",xe,[i("div",Ae,[k((d(),p(w,{type:"error",onClick:e[3]||(e[3]=()=>r(m).performSecureOperation("user:delete","删除用户"))},{default:s(()=>[...e[19]||(e[19]=[n(" 🗑️ 删除用户 ",-1)])]),_:1})),[[g,{permissions:"user:delete",authData:r(o).currentPermissions.value,fallback:"show"}]]),i("div",Me,[t(v,{size:"tiny"},{default:s(()=>[...e[20]||(e[20]=[n("需要: user:delete (点击体验提示)",-1)])]),_:1})])]),i("div",Te,[i("span",{class:D(a("user:delete"))},b(l("user:delete")),3)])]),i("div",$e,[i("div",Re,[k((d(),p(w,{type:"warning",onClick:e[4]||(e[4]=()=>r(m).performSecureOperation("system:admin","系统管理"))},{default:s(()=>[...e[21]||(e[21]=[n(" ⚙️ 系统管理 ",-1)])]),_:1})),[[g,{permissions:"system:admin",authData:r(o).currentPermissions.value,fallback:"hide"}]]),i("div",Ue,[t(v,{size:"tiny"},{default:s(()=>[...e[22]||(e[22]=[n("需要: system:admin (隐藏模式)",-1)])]),_:1})])]),i("div",Ee,[i("span",{class:D(a("system:admin"))},b(l("system:admin")),3)])])])]),_:1})]),_:1}),t(C,{title:"🎯 降级策略演示",size:"small"},{default:s(()=>[t(N,{vertical:""},{default:s(()=>[t(P,{depth:"3",style:{"margin-bottom":"8px"}},{default:s(()=>[...e[23]||(e[23]=[n(" 同一个权限，不同的处理方式 ",-1)])]),_:1}),i("div",Ie,[i("div",Ve,[t(P,{strong:""},{default:s(()=>[...e[24]||(e[24]=[n("隐藏模式 (fallback: 'hide'):",-1)])]),_:1}),k((d(),p(w,{type:"error"},{default:s(()=>[...e[25]||(e[25]=[n(" 🔒 隐藏按钮 ",-1)])]),_:1})),[[g,{permissions:"admin:secret",authData:r(o).currentPermissions.value,fallback:"hide"}]]),t(P,{depth:"3",size:"small"},{default:s(()=>[...e[26]||(e[26]=[n("没权限时完全隐藏",-1)])]),_:1})]),i("div",je,[t(P,{strong:""},{default:s(()=>[...e[27]||(e[27]=[n("禁用模式 (fallback: 'disable'):",-1)])]),_:1}),k((d(),p(w,{type:"warning",onClick:e[5]||(e[5]=()=>r(m).performSecureOperation("admin:secret","管理员操作"))},{default:s(()=>[...e[28]||(e[28]=[n(" 🚫 禁用按钮 ",-1)])]),_:1})),[[g,{permissions:"admin:secret",authData:r(o).currentPermissions.value,fallback:"disable"}]]),t(P,{depth:"3",size:"small"},{default:s(()=>[...e[29]||(e[29]=[n("没权限时禁用但可见",-1)])]),_:1})]),i("div",He,[t(P,{strong:""},{default:s(()=>[...e[30]||(e[30]=[n("显示模式 (fallback: 'show'):",-1)])]),_:1}),k((d(),p(w,{type:"info",onClick:e[6]||(e[6]=()=>r(m).performSecureOperation("admin:secret","管理员操作"))},{default:s(()=>[...e[31]||(e[31]=[n(" 👻 半透明按钮 ",-1)])]),_:1})),[[g,{permissions:"admin:secret",authData:r(o).currentPermissions.value,fallback:"show"}]]),t(P,{depth:"3",size:"small"},{default:s(()=>[...e[32]||(e[32]=[n("没权限时半透明，点击提示",-1)])]),_:1})])])]),_:1})]),_:1}),t(C,{title:"⚡ 高级配置演示",size:"small"},{default:s(()=>[t(N,{vertical:""},{default:s(()=>[i("div",We,[i("div",Ge,[i("div",Xe,[k((d(),p(w,{type:"primary",onClick:e[7]||(e[7]=()=>r(m).performMultiSecureOperation(["user:edit","user:delete"],"编辑或删除","OR"))},{default:s(()=>[...e[33]||(e[33]=[n(" 📝 编辑或删除 (OR模式) ",-1)])]),_:1})),[[g,{permissions:["user:edit","user:delete"],authData:r(o).currentPermissions.value,mode:"OR",fallback:"show"}]]),i("div",Fe,[t(v,{size:"tiny"},{default:s(()=>[...e[34]||(e[34]=[n("需要: user:edit 或 user:delete",-1)])]),_:1})])]),i("div",Je,[i("span",{class:D(c(["user:edit","user:delete"],"OR"))},b(S(["user:edit","user:delete"],"OR")),3)])]),i("div",Ke,[i("div",Qe,[k((d(),p(w,{type:"warning",onClick:e[8]||(e[8]=()=>r(m).performMultiSecureOperation(["user:edit","user:delete"],"编辑且删除","AND"))},{default:s(()=>[...e[35]||(e[35]=[n(" 🔒 编辑且删除 (AND模式) ",-1)])]),_:1})),[[g,{permissions:["user:edit","user:delete"],authData:r(o).currentPermissions.value,mode:"AND",fallback:"show"}]]),i("div",Ze,[t(v,{size:"tiny"},{default:s(()=>[...e[36]||(e[36]=[n("需要: user:edit 且 user:delete",-1)])]),_:1})])]),i("div",qe,[i("span",{class:D(c(["user:edit","user:delete"],"AND"))},b(S(["user:edit","user:delete"],"AND")),3)])]),i("div",Le,[i("div",Ye,[k((d(),p(w,{type:"success",onClick:e[9]||(e[9]=()=>r(m).performSecureOperation("user:*","用户管理"))},{default:s(()=>[...e[37]||(e[37]=[n(" 🌟 通配符权限 (user:*) ",-1)])]),_:1})),[[g,{permissions:"user:*",authData:r(o).currentPermissions.value,fallback:"show"}]]),i("div",es,[t(v,{size:"tiny"},{default:s(()=>[...e[38]||(e[38]=[n("需要: user:* 通配符权限",-1)])]),_:1})])]),i("div",ss,[i("span",{class:D(a("user:*"))},b(l("user:*")),3)])])])]),_:1})]),_:1}),t(C,{title:"📋 面板权限演示",size:"small"},{default:s(()=>[t(N,{vertical:""},{default:s(()=>[k((d(),z("div",ts,[t($,{type:"error",title:"超级管理员面板"},{default:s(()=>[...e[39]||(e[39]=[n(" 只有超级管理员才能看到此面板内容 ",-1)])]),_:1})])),[[g,{permissions:"system:admin",authData:r(o).currentPermissions.value,fallback:"hide"}]]),k((d(),z("div",is,[t($,{type:"info",title:"用户面板"},{default:s(()=>[...e[40]||(e[40]=[n(" 有用户查看权限才能正常使用此面板 ",-1)])]),_:1})])),[[g,{permissions:"user:view",authData:r(o).currentPermissions.value,fallback:"show"}]]),t(P,{depth:"3",size:"small"},{default:s(()=>[...e[41]||(e[41]=[n(" 上方面板会根据权限动态显示/隐藏 ",-1)])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}),t(R,null,{default:s(()=>[t(C,{title:"📝 使用示例",size:"small"},{default:s(()=>[t(X,{value:r(o).activeTab.value,"onUpdate:value":e[10]||(e[10]=y=>r(o).activeTab.value=y),type:"line",size:"small"},{default:s(()=>[t(A,{name:"basic",tab:"基础用法"},{default:s(()=>[t(x,{code:r(T).basic,language:"html"},null,8,["code"])]),_:1}),t(A,{name:"advanced",tab:"高级配置"},{default:s(()=>[t(x,{code:r(T).advanced,language:"html"},null,8,["code"])]),_:1}),t(A,{name:"scenarios",tab:"应用场景"},{default:s(()=>[t(x,{code:r(T).scenarios,language:"html"},null,8,["code"])]),_:1})]),_:1},8,["value"])]),_:1})]),_:1})]),_:1})])}}}),ps=pe(ns,[["__scopeId","data-v-2f898abd"]]);export{ps as default};
