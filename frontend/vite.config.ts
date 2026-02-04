import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'

// Read version from multiple sources
function getVersion(): string {
  try {
    // Try to read from VERSION file in repository root
    const versionFilePath = path.join(__dirname, '..', 'VERSION')
    if (fs.existsSync(versionFilePath)) {
      return fs.readFileSync(versionFilePath, 'utf8').trim()
    }
    
    // Fallback to package.json version
    const packageJsonPath = path.join(__dirname, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      return packageJson.version || '1.0.0'
    }
    
    // Final fallback
    return '1.0.0'
  } catch (error) {
    console.warn('Could not determine version, using fallback:', (error as Error).message)
    return '1.0.0'
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from all network interfaces
    port: 5176, // Existing port from previous configuration
    strictPort: true,
    // Enable network access
    open: true,
    cors: true
  },
  define: {
    // Inject version information at build time
    __APP_VERSION__: JSON.stringify(getVersion()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  // Also set environment variables for runtime access
  envPrefix: ['VITE_', 'REACT_APP_']
})
