module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ['./src/**/*.html', './src/**/*.js', './src/**/*.jsx'],
  theme: {
    extend: {
      fontSize: {
        tiny: '0.65rem',
      },
      maxWidth: {
        15: '15rem',
      },
    },
  },
  variants: {
    margin: ['responsive', 'hover'],
  },
  plugins: [],
};
