module.exports = (api) => {
  api.cache(true);

  console.log('Using backend .bablerc.js');
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
      '@babel/typescript',
    ],
  };
};
