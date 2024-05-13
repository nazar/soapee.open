import path from 'path';

import react from '@vitejs/plugin-react';
import graphql from '@rollup/plugin-graphql';
import VitePluginHtmlEnv from 'vite-plugin-html-env';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default function({ command, mode }) {
  const building = command === 'build';
  const serving = command === 'serve';
  const stating = mode === 'stats';

  if (building) {
    // helps with dev only code elimination during builds
    process.env.NODE_ENV = 'production';
  }

  return {
    plugins: [
      VitePluginHtmlEnv(),
      graphql(),
      serving && react(),
      building && !(stating) && viteCompression(),
      stating && visualizer()
    ],
    resolve: {
      alias: {
        client: path.resolve(__dirname, './src/client'),
        cache: path.resolve(__dirname, './src/cache'),
        components: path.resolve(__dirname, './src/components'),
        hooks: path.resolve(__dirname, './src/hooks'),
        queries: path.resolve(__dirname, './src/queries'),
        services: path.resolve(__dirname, './src/services'),
        schemas: path.resolve(__dirname, './src/schemas'),
        styles: path.resolve(__dirname, './src/styles')
      }
    },
    css: {
      preprocessorOptions: {
        styl: {
          imports: [
            // import global variables for each file
            path.resolve(__dirname, './src/styles/variables.styl'),
            path.resolve(__dirname, './src/styles/mixins/index.styl')
          ]
        }
      }
    },
    server: {
      host: '0.0.0.0',
      hmr: {
        port: 5000,
        path: 'vite-hmr'
      }
    },
    build: {
      outDir: 'build',
      brotliSize: false
    },
    clearScreen: false
  };
}
