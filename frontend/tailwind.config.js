/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primitives — warm cream to dark brown
        neutral: {
          0: '#FFFFFF',
          50: '#FFFBF5',
          100: '#FFF8F0',
          200: '#F5E6E0',
          300: '#E8D5C8',
          400: '#D4A574',
          500: '#C4956A',
          600: '#A67B5B',
          700: '#8B6347',
          800: '#2C1810',
          900: '#1a0e08',
        },
        // Primitives — gold brand
        gold: {
          50: '#FDF8F0',
          100: '#F5E6D0',
          300: '#E8D5C8',
          400: '#DDB88A',
          500: '#D4A574',
          600: '#C4956A',
          700: '#A67B5B',
          800: '#8B6347',
        },
        // Legacy compatibility tokens (used by existing components)
        dark: '#2C1810',
        cream: '#FFF8F0',
        'soft-pink': '#F5E6E0',
        // Semantic
        bg: '#FFFBF5',
        surface: '#FFFFFF',
        'surface-alt': '#FFF8F0',
        border: '#F5E6E0',
        'border-strong': '#E8D5C8',
        text: '#2C1810',
        'text-muted': '#8B6347',
        'text-subtle': '#D4A574',
        primary: '#D4A574',
        'primary-hover': '#C4956A',
        'primary-active': '#A67B5B',
        'primary-subtle': '#FDF8F0',
        success: '#6B8F71',
        'success-subtle': '#E8F0E6',
        warning: '#D4A574',
        'warning-subtle': '#FDF8F0',
        danger: '#C4432E',
        'danger-subtle': '#F6E1DC',
        info: '#2E6FA8',
        'info-subtle': '#DCE9F3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
        script: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(44, 24, 16, 0.06)',
        md: '0 2px 8px rgba(44, 24, 16, 0.08), 0 1px 2px rgba(44, 24, 16, 0.04)',
        lg: '0 8px 24px rgba(44, 24, 16, 0.12), 0 2px 6px rgba(44, 24, 16, 0.06)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-6px) rotate(1deg)' },
          '66%': { transform: 'translateY(3px) rotate(-1deg)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.8s ease-out',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
