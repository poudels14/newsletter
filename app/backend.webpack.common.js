const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './backend/server.js',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'build/server'),
    filename: '[name].js',
  },
  resolve: {
    alias: {},
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            emitError: true,
            emitWarning: true,
            failOnError: true,
          },
        },
      },
      {
        test: /\.(js|ts)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
};
