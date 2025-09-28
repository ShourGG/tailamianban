import { fileURLToPath, URL } from 'node:url'

export default {
  alias: {
    '@': fileURLToPath(new URL('../../../src', import.meta.url)),
    _views: fileURLToPath(new URL('../../../src/views', import.meta.url)),
  },
}
