module.exports = {
  presets: [
    '@babel/env',
    [
      '@babel/preset-react',
      {
        pragma: 'h',
      },
    ],
  ],
  plugins: ['macros', '@babel/plugin-proposal-optional-chaining'],
};
