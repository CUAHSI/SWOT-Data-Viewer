import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import crypto from 'crypto'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'

// Polyfill for Node 18+
if (!crypto.hash) {
  crypto.hash = crypto.createHash
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Get the current directory using import.meta.url instead of process.cwd()
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const env = loadEnv(mode, currentDir)
  
  return {
    plugins: [vue(), vuetify(), vueDevTools()],
    root: './',
    assetsInclude: ['**/*.md'],
    // for GH pages deployment, set VITE_APP_BASE=/com_res/ in .env
    base: env.VITE_APP_BASE || '/',
    envDir: '../',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173
    }
  }
})