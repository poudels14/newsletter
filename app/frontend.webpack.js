const path = require('path');
const merge = require('webpack-merge');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const commonConfig = {
  entry: './frontend/index.jsx',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'build/static'),
    filename: '[name].[chunkhash].js',
  },
  resolve: {
    alias: {},
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
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif|woff(2)?|ttf|eot)$/,
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
    new HtmlWebPackPlugin({
      template: './frontend/index.html',
      showErrors: process.env.NODE_ENV !== 'production',

      title: 'The Reading App',
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
  devtool: 'source-map',
};

module.exports = merge(
  commonConfig,
  process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig
);
