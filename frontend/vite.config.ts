import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: true,
      port: 8080,
      headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://healthcare1-h2mi.onrender.com;"
      }
    },
    build: {
      sourcemap: mode === 'development',
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('@radix-ui')) {
                return 'radix-vendor';
              }
              return 'vendor';
            }
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') return 'assets/[name][extname]';
            return 'assets/[name]-[hash][extname]';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_ENV),
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@radix-ui/react-icons'],
    },
  };
});
