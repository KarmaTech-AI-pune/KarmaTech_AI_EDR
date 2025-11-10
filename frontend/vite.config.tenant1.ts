import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Different port for tenant1
    host: 'tenant1.localhost'
  },
  define: {
    'process.env.VITE_TENANT_ID': '"tenant1"',
    'process.env.VITE_API_BASE_URL': '"http://tenant1.localhost:5000/api"'
  }
}) 