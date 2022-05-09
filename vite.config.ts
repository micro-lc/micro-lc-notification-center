import {resolve} from 'path'

import {visualizer} from 'rollup-plugin-visualizer'
import {defineConfig} from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dynamicImport(),
    visualizer()
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'root-entry-name': 'variable'
        }
      }
    }
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'Fragment',
    minify: true,
    legalComments: 'none',
    charset: 'utf8'
  },
  build: {
    target: 'ES2015',
    rollupOptions: {
      input: {
        'micro-lc-notification-center': resolve(__dirname, 'src/index.min.ts'),
      },
      output: {
        entryFileNames: ({name}) => `${name}.esm.js`,
        manualChunks: {
          adoptedStyleSheets: ['construct-style-sheets-polyfill'],
          engine: ['react', 'react-dom', 'lit'],
          antd: ['antd/es', '@ant-design/colors', '@ant-design/icons/es/icons'],
          index: ['src/index.min.ts']
          // antd: ['antd', '@ant-design/colors', 'tinycolor2'],
          // fontawesome: ['@fortawesome/react-fontawesome'],
          // 'dynamic-icons': ['../back-kit/lib/utils/dynamic-icon.js'],
          // index: ['src/index.lit.bk.ts'],
          // 'csv-stringify': ['csv-stringify/browser/esm/sync']
        }
      }
    },
    outDir: 'dist/unpkg',
    emptyOutDir: false,
    manifest: true,
    minify: 'esbuild'
  },
  resolve: {
    alias: [
      {
        find: /@ln/,
        replacement: './../node_modules/dayjs/locale'
      }
    ]
  }
})
