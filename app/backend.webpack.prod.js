const merge = require('webpack-merge');
const common = require('./backend.webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
});
