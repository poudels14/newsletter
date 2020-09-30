const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./backend.webpack');

module.exports = merge(commonConfig, {
  entry: './backend/emailprocessing/main.js',
  output: {
    path: path.resolve(__dirname, 'build/backend/emailprocessing/'),
    filename: '[name].js',
  },
});
