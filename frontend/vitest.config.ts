import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    deps: {
      optimizer: {
        web: {
          include: ['axios']
        }
      }
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/e2e-test-template.spec.ts',
      '**/playwright.config.ts'
    ],
    include: [
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/test/**/*.test.{ts,tsx}'
    ],
    server: {
      deps: {
        inline: [/@mui\/material/, /@mui\/lab/],
      },
    }
  },
})
