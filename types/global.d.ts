declare module '@/plugins/naive-ui' {
  import type { App } from 'vue'
  export function setupNaiveUI(app: App): void
  export const notification: typeof import('naive-ui').useNotification
}
