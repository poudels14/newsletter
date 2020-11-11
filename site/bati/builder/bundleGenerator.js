const generateBundle = (jsxPath) => {
  return `import { h, hydrate } from 'preact';
import Page from '${jsxPath}';
hydrate(<Page />, document.body);
`;
};

module.exports = generateBundle;
