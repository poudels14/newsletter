const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const commonConfig = {
  entry: './frontend/index.jsx',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'build/static'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
  },
  resolve: {
    alias: {
      heroicons: path.resolve(__dirname, './frontend/assets/heroicons'),
      ui: path.resolve(__dirname, './frontend/components/'),
      utils: path.resolve(__dirname, './frontend/utils/'),
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            emitError: process.env.NODE_ENV === 'production',
            emitWarning: true,
            failOnError: process.env.NODE_ENV === 'production',
            plugins: ['react', 'react-hooks'],
          },
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.less$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.(css)$/i,
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
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),
    new HtmlWebPackPlugin({
      template: './frontend/index.html',
      filename: 'index.html',
      showErrors: process.env.NODE_ENV !== 'production',

      title: 'Alpine',
      base: '/',
      libraries: {
        react:
          process.env.NODE_ENV !== 'production'
            ? 'https://cdnjs.cloudflare.com/ajax/libs/react/16.13.1/umd/react.development.js'
            : 'https://cdnjs.cloudflare.com/ajax/libs/react/16.13.1/umd/react.production.min.js',
        reactDom:
          process.env.NODE_ENV !== 'production'
            ? 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.13.1/umd/react-dom.development.js'
            : 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.13.1/umd/react-dom.production.min.js',
      },
      gmailConfig: JSON.stringify({
        clientId: process.env.GMAIL_CLIENT_ID,
        apiKey: process.env.GMAIL_API_KEY,
      }),
      inject: true,
    }),
    new HtmlWebPackPlugin({
      template: './frontend/signin.html',
      filename: 'signin.html',
      showErrors: process.env.NODE_ENV !== 'production',
      title: 'Sign in',
      base: '/',
      gmailConfig: JSON.stringify({
        clientId: process.env.GMAIL_CLIENT_ID,
        apiKey: process.env.GMAIL_API_KEY,
      }),
      gmailClientId: process.env.GMAIL_CLIENT_ID,
      inject: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: './frontend/assets/',
          to: 'assets/',
        },
        {
          from: 'manifest.webmanifest.json',
          to: 'manifest.webmanifest.json',
        },
      ],
    }),
  ],
};

const developmentConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 8002,
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
  // plugins: [
  //   new BundleAnalyzerPlugin({
  //     generateStatsFile: true,
  //   }),
  // ]
};

module.exports = merge(
  commonConfig,
  process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig
);
