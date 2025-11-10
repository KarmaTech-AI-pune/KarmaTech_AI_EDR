import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175, // Different port for tenant2
    host: 'tenant2.localhost'
  },
  define: {
    'process.env.VITE_TENANT_ID': '"tenant2"',
    'process.env.VITE_API_BASE_URL': '"http://tenant2.localhost:5000/api"'
  }
}) 