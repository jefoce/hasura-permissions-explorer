import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

type BuildTarget = 'main' | 'embedded';

// Get build target from command line argument
// Usage: vite build -- main    (builds index.html)
// Usage: vite build -- embedded (builds src/main-embedded.tsx as library)
function getBuildTarget(): BuildTarget {
  const targetArg = process.argv.find((arg) => arg === 'main' || arg === 'embedded');
  return (targetArg as BuildTarget) || 'main';
}

const buildTarget = getBuildTarget();
console.log('Building target:', buildTarget);

// Build configuration for main app (index.html)
function getMainBuildConfig() {
  return {
    emptyOutDir: true,
    minify: 'terser' as const,
    lib: undefined,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
      output: {
        entryFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
        inlineDynamicImports: true,
        compact: true,
      },
    },
  };
}

// Build configuration for embedded app (library build)
function getEmbeddedBuildConfig() {
  return {
    emptyOutDir: false,
    minify: 'terser' as const,
    lib: {
      entry: path.resolve(__dirname, 'src/main-embedded.tsx'),
      name: 'EmbeddedApp',
      fileName: () => 'embedded.js',
      formats: ['es' as const],
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
      output: {
        entryFileNames: 'assets/embedded.js',
        assetFileNames: 'assets/embedded[extname]',
        inlineDynamicImports: true,
        compact: true,
      },
    },
  };
}

// Get build configuration based on target
function getBuildConfig() {
  if (buildTarget === 'main') {
    return getMainBuildConfig();
  }
  return getEmbeddedBuildConfig();
}

const buildConfig = getBuildConfig();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/hasura-permissions-explorer/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: buildConfig,
});
