import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RatelimitPages',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@sudobility/components',
        '@sudobility/design',
        '@sudobility/ratelimit_client',
        '@sudobility/ratelimit-components',
        '@sudobility/types',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@sudobility/components': 'SudobilityComponents',
          '@sudobility/design': 'SudobilityDesign',
          '@sudobility/ratelimit_client': 'SudobilityRatelimitClient',
          '@sudobility/ratelimit-components': 'SudobilityRatelimitComponents',
          '@sudobility/types': 'SudobilityTypes',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
