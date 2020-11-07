module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ['./frontend/**/*.html', './frontend/**/*.jsx'],
  theme: {
    extend: {
      spacing: {
        '9/2': '1.125rem',
      },
      boxShadow: {
        outline: '0 0 0 2px rgba(66, 153, 225, 0.3)',
      },
    },
  },
  variants: {},
  plugins: [],
};
