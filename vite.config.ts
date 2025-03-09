import { svelte } from '@sveltejs/vite-plugin-svelte'
import UnoCSS from '@unocss/svelte-scoped/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS({
      // injectReset: '@unocss/reset/normalize.css', // 见类型定义了解所有包含的重置选项或如何传入你自己的
      // ...其他 Svelte 作用域选项
    }),
    svelte()
  ]
})
