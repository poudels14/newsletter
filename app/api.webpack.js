const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./backend.webpack');

module.exports = merge(commonConfig, {
  entry: './api/server.ts',
  output: {
    path: path.resolve(__dirname, 'build/apiserver/'),
    filename: '[name].js',
  },
});
