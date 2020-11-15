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
          autoLabel: 'dev-only',
          labelFormat: '[local]',
          cssPropOptimization: true,
        },
      ],
    ],
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      [
        'import',
        {
          libraryName: 'antd',
          style: true,
        },
      ],
    ],
  };
};
