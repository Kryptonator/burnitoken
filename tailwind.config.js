module.exports = {
  content: ['./index.html', './404.html', './src/**/*.{html,js,css}', './assets/**/*.{html,js}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        'baloo-2': ['"Baloo 2"', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'burni-orange': '#EA580C',
        'burni-orange-dark': '#C2410C',
        'burni-blue': '#1E40AF',
        'burni-purple': '#7C3AED',
        'dark-bg': '#111827',
        'dark-card': '#1F2937',
        'dark-text': '#F3F4F6',
        'dark-text-secondary': '#D1D5DB',
      },
      height: {
        chart: '300px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(234, 88, 12, 0.5)',
        'glow-dark': '0 0 20px rgba(194, 65, 12, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
