module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      [
        '@emotion/babel-preset-css-prop',
        {
          sourceMap: true,
          autoLabel: process.env.NODE_ENV !== 'production',
          labelFormat: '[local]',
          cssPropOptimization: true,
        },
      ],
    ],
  };
};
