/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#ffffff',
          soft: '#f6f8fb',
          gray: '#e5e7eb',
        },
        panel: {
          DEFAULT: '#ffffff',
          2: '#fafbff',
        },
        ink: {
          DEFAULT: '#1f2937',
          soft: '#4b5563',
        },
        primary: {
          DEFAULT: '#2563eb', // 藍
          light: '#597EF7',
          dark: '#1D39C4',
        },
        accent: '#16a34a', // 綠
        warn: '#f59e0b',   // 黃
        danger: '#ef4444', // 紅
        cyan: '#06b6d4',
        orange: '#fb923c',
        success: '#22c55e',
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'lg': '14px',
        'md': '12px',
        'sm': '10px',
      },
      boxShadow: {
        DEFAULT: '0 6px 24px rgba(0, 0, 0, 0.06)',
        soft: '0 2px 12px rgba(0, 0, 0, 0.05)',
      },
      // spacing: {
      //   '18': '4.5rem', // 72px
      // }
    },
  },
  plugins: [],
};
