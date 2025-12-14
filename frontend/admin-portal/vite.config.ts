import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'



// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 監聽所有以 /api 開頭的請求
      '/api': {
        // 轉發到 NestJS 的位址
        target: 'http://localhost:3000', 
        changeOrigin: true,
        // *** 核心修正：在轉發前，將 /api/ 從路徑中移除 ***
        rewrite: (path) => path.replace(/^\/api/, ''),}
      }}
})
