import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        sourcemap: true,
        outDir: 'build/public',
        minify: false
    },
})
