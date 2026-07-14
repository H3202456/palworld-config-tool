import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const host = process.env.TAURI_DEV_HOST
const isTauriDebug = Boolean(process.env.TAURI_ENV_DEBUG)

export default defineConfig({
  plugins: [react()],

  // 保留 Rust 和 Tauri 的终端报错
  clearScreen: false,

  server: {
    // 必须与 tauri.conf.json 中的 devUrl 端口一致
    port: 5173,
    strictPort: true,

    host: host || false,

    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,

    // Rust 文件变化时，不让 Vite 重复刷新
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },

  envPrefix: ['VITE_', 'TAURI_ENV_*'],

  build: {
    target:
      process.env.TAURI_ENV_PLATFORM === 'windows'
        ? 'chrome105'
        : 'safari13',

    // Vite 8 使用 Oxc，不再使用已弃用的 esbuild 压缩
    minify: isTauriDebug ? false : 'oxc',

    sourcemap: isTauriDebug,
  },
})
