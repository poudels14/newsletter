const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./backend.webpack');

module.exports = merge(commonConfig, {
  entry: './backend/api/server.ts',
  output: {
    path: path.resolve(__dirname, 'build/backend/api/'),
    filename: '[name].js',
  },
});
