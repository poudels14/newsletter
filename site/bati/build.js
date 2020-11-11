const path = require('path');
const process = require('process');
const assert = require('assert').strict;
const rimraf = require('rimraf');
const webpack = require('webpack');

const htmlRenderer = require('./builder/renderer');
const generateBundle = require('./builder/bundleGenerator');

const TEMPORARY_BUILD_DIRECTORY = path.resolve(__dirname, '.build/');

const GENERATOR_PLUGIN_NAME = 'BatiGeneratorPlugin';
class GeneratorPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tap(GENERATOR_PLUGIN_NAME, (compilation) => {
      const assets = compilation.getAssets();
      const jsSources = assets.filter((asset) => asset.name.endsWith('.js'));

      const html = htmlRenderer({
        path: this.options.jsxComponentFile,
        pageConfig: this.options.pageConfig,
        scriptSources: jsSources.map((jsSources) => jsSources.name),
        styleSources: assets
          .filter((asset) => asset.name.endsWith('.css'))
          .map((assets) => assets.name),
        minify: {
          // https://www.npmjs.com/package/html-minifier-terser#options-quick-reference
          collapseWhitespace: true,
          keepClosingSlash: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
        },
      });
      compilation.assets['index.html'] = {
        source: () => html,
        size: () => html.length,
      };
      rimraf.sync(TEMPORARY_BUILD_DIRECTORY);
      console.log('All pages generated...');
    });
  }
}

const LIBRARY_PLUGIN_NAME = 'BatiLibraryPlugin';
class LibraryPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.run.tap(LIBRARY_PLUGIN_NAME, (compilation) => {
      console.log('The webpack build process is starting!!!');
    });

    compiler.hooks.emit.tap(LIBRARY_PLUGIN_NAME, (compilation, callback) => {
      console.log(
        'emittedAssets = ',
        compilation.getAssets().map((a) => a.name)
      );
      const assets = compilation.getAssets();
      const jsSources = assets.filter((asset) => asset.name.endsWith('.js'));
      assert(jsSources.length === 1, 'Only 1 JS file should be emitted');

      const emittedJsFilename = jsSources[0].name;
      const entry = compilation.options.entry;
      assert(entry.main.import.length === 1);

      const bundleSrc = generateBundle(entry.main.import[0]);
      compilation.assets[`bundler.${emittedJsFilename}`] = {
        source: () => bundleSrc,
        size: () => bundleSrc.length,
      };

      const bundlerEntry = path.resolve(
        TEMPORARY_BUILD_DIRECTORY,
        `bundler.${emittedJsFilename}`
      );
      const jsxComponentFile = path.resolve(
        TEMPORARY_BUILD_DIRECTORY,
        emittedJsFilename
      );
      const webpackConfig = {
        ...this.options.webpackConfig,
        entry: bundlerEntry,
        optimization: {
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                  const packageName = module.context.match(
                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                  )[1];
                  // npm package names are URL-safe, but some servers don't like @ symbols
                  return `npm.${packageName.replace('@', '')}`;
                },
              },
            },
          },
        },
        output: {
          path: this.options.batiConfig.output.path,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[name].[chunkhash].js',
        },
      };

      let compiler = webpack(webpackConfig);
      new GeneratorPlugin({
        ...this.options,
        jsxComponentFile,
      }).apply(compiler);
      compiler.run(function (err, stats) {
        if (err) {
          throw err;
        }
      });
    });
  }
}

const generatePage = ({ pageConfig, batiConfig, webpackConfig }) => {
  const finalWebpackConfig = {
    ...webpackConfig,
    entry: pageConfig.source,
    externals: {
      preact: 'preact',
    },
    output: {
      path: TEMPORARY_BUILD_DIRECTORY,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[name].[chunkhash].js',
      library: 'BatiPage',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
  };

  let compiler = webpack(finalWebpackConfig);
  new LibraryPlugin({
    pageConfig,
    batiConfig,
    webpackConfig,
  }).apply(compiler);
  compiler.run(function (err, stats) {
    if (err) {
      throw err;
    }
  });
};

const generate = async () => {
  const config = require(path.resolve(process.cwd(), './bati.config.js'));

  rimraf.sync(config.output.path);
  rimraf.sync(TEMPORARY_BUILD_DIRECTORY);

  config.pages.forEach((pageConfig) => {
    console.log('Building: ', pageConfig.source);
    const webpackConfig = require(config.webpackConfig.file);

    generatePage({
      pageConfig,
      batiConfig: config,
      webpackConfig,
    });
  });
};

module.exports = generate;
