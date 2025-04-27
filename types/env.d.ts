import { DefineComponent } from 'vue'

declare module '_views/*' {
  const component: DefineComponent
  export default component
}

declare module '*.vue' {
  const component: DefineComponent<object, object, unknown>
  export default component
}
