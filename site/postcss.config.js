module.exports = {
  plugins: [
    //require('postcss-import'),
    require('tailwindcss'),
    //require('postcss-nesting'),
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    }),
  ],
};
