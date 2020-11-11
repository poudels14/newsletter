const path = require('path');

module.exports = {
  webpackConfig: {
    file: path.resolve(__dirname, './webpack.config.js'),
  },
  pages: [
    {
      source: path.resolve(__dirname, './src/pages/homepage.jsx'),
      meta: {
        title: 'Alpine Reader',
        description:
          'Alpine Reader organizes your newsletters so you can get the best out of what you paid for. Read smart by highlighting and annotating.',
      },
    },
  ],
  output: {
    path: path.resolve(__dirname, 'build/static/'),
  },
};
