import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
// Use /<repo>/ on GitHub Pages build, and "/" locally
export default defineConfig(({ mode }) => {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? ''
  const isUserSite = repo.endsWith('.github.io')
  const base = mode === 'production' ? (isUserSite ? '/' : repo ? `/${repo}/` : '/') : '/'
  return {
    plugins: [react()],
    base,
  }
})
