import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Vite config for building the Escape Pod (single-file offline recovery tool)
 */
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
  ],
  build: {
    outDir: 'dist-offline',
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: Infinity,
    rollupOptions: {
      input: 'offline.html',
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'tesssera_recovery.js',
      },
    },
  },
});
