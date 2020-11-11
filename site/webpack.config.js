// const path = require('path');
const merge = require('webpack-merge');
const ESLintPlugin = require('eslint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin;

const developmentMode = process.env.NODE_ENV !== 'production';

const commonConfig = {
  target: 'web',
  // output: {
  //   path: path.resolve(__dirname, 'build/'),
  //   filename: '[name].[chunkhash].js',
  //   chunkFilename: '[name].[chunkhash].js',
  // },
  resolve: {
    alias: {},
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(css)$/i,
        // 'style-loader',
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(png|jpg|gif|woff(2)?|ttf|eot)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]-[contenthash].[ext]',
          },
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      minChunks: 1,
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: developmentMode ? '[name].css' : '[name].[contenthash].css',
      chunkFilename: developmentMode ? '[id].css' : '[id].[contenthash].css',
    }),
    new CleanWebpackPlugin(),
    new ESLintPlugin({
      context: './src',
      formatter: 'codeframe',
      emitError: !developmentMode,
      emitWarning: true,
      failOnError: !developmentMode,
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'server'
    // })
  ],
};

const developmentConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 8000,
    before: function (app, server, compiler) {
      app.get('*', function (req, res, next) {
        console.log('path = ', req.path);
        next();
      });
    },
  },
};

const productionConfig = {
  mode: 'production',
};

module.exports = merge(
  commonConfig,
  developmentMode ? developmentConfig : productionConfig
);
