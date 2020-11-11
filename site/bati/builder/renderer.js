const render = require('preact-render-to-string');
const h = require('preact').h;
const htmlMinifier = require('html-minifier-terser');

const buildScriptElement = (src) => {
  return `<script type="text/javascript" src="${src}"></script>`;
};

const buildStyleElement = (src) => {
  return `<link href="${src}" rel="stylesheet" type="text/css" />`;
};

const buildMetas = (pageConfig) => {
  const meta = pageConfig ? pageConfig.meta : null;
  if (!meta) return '';
  return [
    meta.description
      ? `<meta content="${meta.description}" name="description" />`
      : '',
    meta.ogDescription || meta.description
      ? `<meta content="${
          meta.ogDescription || meta.description
        }" property="og:description" />`
      : '',
    meta.twitterDescription || meta.description
      ? `<meta content="${
          meta.twitterDescription || meta.description
        }" property="twitter:description" />`
      : '',
    meta.ogTitle || meta.title
      ? `<meta content="${meta.ogTitle || meta.title}" property="og:title" />`
      : '',
    meta.twitterTitle || meta.title
      ? `<meta content="${
          meta.twitterTitle || meta.title
        }" property="twitter:title" />`
      : '',
    meta.twitterCard
      ? `<meta content="${meta.twitterCard}" name="twitter:card" />`
      : '',
  ].join('\n');
};

const renderer = (config) => {
  const Page = require(config.path);
  const body = render(h(Page.default));

  const scripts = (config.scriptSources || [])
    .map(buildScriptElement)
    .join('\n');
  const styles = (config.styleSources || []).map(buildStyleElement).join('\n');
  return htmlMinifier.minify(
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Cache-control" content="no-cache, no-store, must-revalidate" />

        ${buildMetas(config.pageConfig)}

        <meta property="og:type" content="website" />
        <meta content="bati" name="generator" />
        ${
          config.favicon
            ? `<link rel="icon" type="image/png" href="${config.favicon}" />`
            : ''
        }
        ${
          config.manifest
            ? `<link rel="manifest" href="${config.manifest}" />`
            : ''
        }
        ${config.styles || ''}
        ${styles}
        <title>${config.title || 'Bati Page'}</title>
      </head>
      <body>
        ${body || ''}
        ${config.scripts || ''}
        ${scripts}
      </body>
    </html>`,
    config.minify
  );
};

module.exports = renderer;
