const merge = require('webpack-merge');
var cookieParser = require('cookie-parser');

const common = require('./frontend.webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 8002,
    historyApiFallback: true,
  },
});
