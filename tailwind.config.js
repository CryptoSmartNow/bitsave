// ... existing imports and config
module.exports = {
  // ... other config
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-exo)', 'sans-serif'],
      },
      // Add smooth scrolling configuration
      animation: {
        'smooth-scroll': 'smooth-scroll 1s ease-in-out',
        'spin-slow': 'spin 8s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'dash': 'dash 2s ease-out forwards',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      keyframes: {
        'smooth-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(var(--scroll-y, 0))' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'dash': {
          'to': { strokeDashoffset: '0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      // ... other theme extensions
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // Add a plugin for smooth scrolling behavior
    function({ addBase }) {
      addBase({
        'html': {
          scrollBehavior: 'smooth',
        },
      });
    },
    // ... other plugins
  ],
  // ... plugins, etc.
}