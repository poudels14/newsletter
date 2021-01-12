const colors = require('tailwindcss/colors');

module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ['./frontend/**/*.html', './frontend/**/*.jsx'],
  theme: {
    extend: {
      colors: {
        gray: colors.coolGray,
        blueGray: colors.blueGray,
      },
      spacing: {
        '9/2': '1.125rem',
      },
      boxShadow: {
        outline: '0 0 0 2px rgba(66, 153, 225, 0.3)',
      },
    },
  },
  variants: {
    display: ['focus', 'group-focus', 'group-hover', 'focus-within'],
    opacity: ['disabled'],
  },
  plugins: [require('@tailwindcss/forms')],
};
