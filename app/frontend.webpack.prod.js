const merge = require('webpack-merge');
const common = require('./frontend.webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
});
