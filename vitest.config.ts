import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    restoreMocks: true,
    hookTimeout: 10000,
    testTimeout: 10000,
    environmentMatchGlobs: [
      ['apps/web/**', 'jsdom'],
      ['packages/server/**', 'node']
    ],
    setupFiles: [
      resolve(__dirname, 'apps/web/src/test-setup.ts')
    ]
  }
})
