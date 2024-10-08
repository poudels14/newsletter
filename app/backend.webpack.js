const path = require('path');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const commonConfig = {
  target: 'node',
  externals: [nodeExternals()],
  resolve: {
    alias: {
      Http: path.resolve(__dirname, 'backend/http'),
      Utils: path.resolve(__dirname, 'backend/utils'),
      Repos: path.resolve(__dirname, 'backend/repos'),
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
            // emitError: process.env.NODE_ENV === 'production',
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

const productionConfig = {
  mode: 'production',
};

const developmentConfig = {
  mode: 'development',
};

module.exports = merge(
  commonConfig,
  process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig
);
