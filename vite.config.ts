import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 相対パスにしておくことで、GitHub Pagesのプロジェクトページ
  // (https://<user>.github.io/<repo>/) でもリポジトリ名を書き換えずに動く。
  base: './',
})
