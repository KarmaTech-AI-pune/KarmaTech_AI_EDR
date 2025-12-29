import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/UI/',
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from all network interfaces
    port: 5176, // Existing port from previous configuration
    strictPort: true,
    // Enable network access
    open: true,
    cors: true
  }
})
