import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
// Use /<repo>/ on GitHub Pages build, and "/" locally
export default defineConfig(({ mode }) => {
  const repo = ((globalThis as any).process?.env?.GITHUB_REPOSITORY as string | undefined)?.split('/')?.[1] ?? ''
  const isUserSite = repo ? repo.endsWith('.github.io') : false
  const base = mode === 'production' ? (isUserSite ? '/' : repo ? `/${repo}/` : '/') : '/'
  return {
    plugins: [react()],
    base,
  }
})
