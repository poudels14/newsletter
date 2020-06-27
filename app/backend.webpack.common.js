const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './backend/server.js',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'build/server/'),
    filename: '[name].js',
  },
  resolve: {
    alias: {
      Http: path.resolve(__dirname, 'backend/http'),
      Utils: path.resolve(__dirname, 'backend/utils'),
      Authorize: path.resolve(__dirname, 'backend/authorize'),
    },
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            emitError: process.env.NODE_ENV === 'production',
            emitWarning: true,
            failOnError: process.env.NODE_ENV === 'production',
          },
        },
      },
      {
        test: /\.(js|ts|jsx)$/,
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
