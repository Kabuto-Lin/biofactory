import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import AutoImport from 'unplugin-auto-import/vite';

// '已於 2025-04-14 升級至 Vite 6 + plugin-react 4.x，等官方釋出 5.x 時再升級';
// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              target: '19', // 指定 React 19
            },
          ],
        ],
      },
    }),
    AutoImport({
      imports: [
        'react', // 自動載入 React API，例如 useState, useEffect
        {
          'react-hook-form': ['useForm', 'Controller', 'useFieldArray'], // 自動載入 react-hook-form 的 API
        },
        {
          'react-redux': ['useDispatch', 'useSelector'], // 自動載入 react-redux 的 API
        },
        {
          sweetalert2: [['default', 'Swal']], // 將 default 導入重命名為 Swal
        },
        {
          '@fortawesome/react-fontawesome': ['FontAwesomeIcon'],
          '@fortawesome/free-solid-svg-icons': [
            // 需要的圖標
            'faUser',
            'faTrashCan',
            'faGear',
            'faBackwardStep',
            'faChevronLeft',
            'faChevronRight',
            'faForwardStep',
            'faFloppyDisk',
            'faRotateLeft',
            'faPenToSquare',
            'faCircleArrowLeft',
            'faTriangleExclamation',
            'faFileExcel',
            'faEye',
            'faFilePdf',
            'faCode',
            'faPlus',
            'faMinus',
            'faTimes',
            'faTrashCan',
            'faFileCsv',
            'faMagnifyingGlass',
            'faCopy',
            'faArrowUpShortWide',
            'faArrowDownShortWide',
            'faThumbtackSlash',
            'faThumbtack',
            'faCirclePlus',
            'faCircleDown',
          ],
        },
      ],
      dirs: ['./src/components', './src/store', './src/utils', './src/services'], // 自動載入指定目錄下的檔案，用於模組化的組件、自定義 hooks 或工具函式。
      eslintrc: {
        enabled: true, // 自動生成 ESLint 配置檔
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
      defaultExportByFilename: true,
    }),
  ],
  build: {
    minify: false, // 禁用壓縮
    sourcemap: true, // 啟用 Source Map
  },
  test: {
    // 使用 Vitest （Vite 6 支援內建 test 設定）
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
