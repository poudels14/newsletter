const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./backend.webpack');

module.exports = merge(commonConfig, {
  entry: './emailprocessing/main.js',
  output: {
    path: path.resolve(__dirname, 'build/emailprocessing/'),
    filename: '[name].js',
  },
});
