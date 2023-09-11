import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  console.log('command: ' + command)
  console.log('mode: ' + mode)

  return{
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/'),
        '@fairy': path.resolve(__dirname, '../fairy/src/'),
        '@repo': path.resolve(__dirname, '../@repo/'),
      },
    },
  }
})
