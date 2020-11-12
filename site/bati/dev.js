const path = require('path');
const fs = require('fs');
const process = require('process');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const generateBundle = require('./builder/bundleGenerator');

const createEntryFile = (pageSource) => {
  const tmpDir = path.resolve(__dirname, './.build');
  const entryFile = path.resolve(tmpDir, 'entry.jsx');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  const content = generateBundle(pageSource);
  fs.writeFile(entryFile, content, function (err) {
    if (err) {
      throw err;
    }
  });
  return entryFile;
};

const generate = async () => {
  const config = require(path.resolve(process.cwd(), './bati.config.js'));

  const webpackConfig = require(config.webpackConfig.file);
  const finalWebpackConfig = {
    ...webpackConfig,
    entry: createEntryFile(config.pages[0].source),
    output: {
      path: config.output.path,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].[chunkhash].js',
    },
  };

  let compiledChunks = [];
  const devServerOptions = {
    ...finalWebpackConfig.devServer,
    stats: {
      colors: true,
    },
    before: function (app, server, compiler) {
      compiler.hooks.emit.tap('BEFORE CALLED', (compilation) => {
        compiledChunks = compilation.getAssets();
      });

      app.get('*', function (req, res, next) {
        if (req.path === '/') {
          const cssSources = compiledChunks.filter((asset) =>
            asset.name.endsWith('.css')
          );
          const jsSources = compiledChunks.filter((asset) =>
            asset.name.endsWith('.js')
          );
          return res.send(`
            <html>
              <head>
                <title>Bati page - dev </title>
                ${(cssSources || []).map(
                  (asset) =>
                    `<link href="${asset.name}" rel="stylesheet" type="text/css" />`
                )}
              </head>
              <body></body>
              ${(jsSources || []).map(
                (asset) => `<script src="${asset.name}"></script>`
              )}
            </html>
          `);
        }
        console.log('PATH = ', req.path);
        next();
      });
    },
  };

  let compiler = webpack(finalWebpackConfig);
  const server = new WebpackDevServer(compiler, devServerOptions);
  server.listen(8000, '127.0.0.1', () => {
    console.log('Starting server on http://localhost:8080');
  });
};

module.exports = generate;
