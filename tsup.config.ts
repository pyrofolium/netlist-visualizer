// tsup.config.ts
import {defineConfig} from 'tsup'

export default defineConfig({
    entry: ['src/backend/server.ts'],
    format: ['esm'],
    dts: false,
    splitting: false,
    outDir: 'build',
    treeshake: true,
    sourcemap: true,
    tsconfig: 'tsconfig.backend.json',
    // minify: true,
    target: 'node18',
    external: [
        'express',
        'passport',
        'passport-local',
        'passport-jwt',
        'bcrypt',
        'jsonwebtoken',
        'pg'
    ]
})