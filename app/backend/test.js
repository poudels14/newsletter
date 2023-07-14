var vfile = require('to-vfile');
var unified = require('unified');
var parse = require('rehype-parse');
var filter = require('unist-util-filter');
var map = require('unist-util-map');
var csso = require('csso');

const toHtml = require('hast-util-to-html');
const sast = require('sast');
var ClassList = require('hast-util-class-list');
const hash = require('@emotion/hash').default;

const Base64 = require('js-base64').Base64;

const x = unified().use(parse); //, {emitParseErrors: true, duplicateAttribute: false})
// .use(rehype2remark)
// .use(stringify)
// .process(vfile.readSync('example.html'), function(err, file) {
//   // console.error(report(err || file))
//   console.log(String(file))
// })

const parsed = x.parse(vfile.readSync('example.html'));
// const filteredTree = filter(parsed, node => {
//   const isStyleNode = node.type === 'element' && node.tagName === 'style'
//   return !isStyleNode
// })
filteredTree = parsed;

const originalStylesheet = [];
const stylesheet = [];

const styleRemoved = map(filteredTree, (node) => {
  console.log('node.tagName =', node.tagName);
  // if (node.type === 'element' && node.properties.width) {
  //   // console.log("with width = ", node)
  //   node.properties.style = (node.properties.style || '').concat(`;width: ${node.properties.width}`);
  // }

  // if (node.properties && node.properties.style) {
  //   console.log("with styl = ", node)
  // }

  if (node.properties && node.properties.style) {
    const cssAst = sast.parse(node.properties.style);
    const filteredCssAst = filter(cssAst, (node) => {
      const shouldRemove =
        node.type === 'declaration' &&
        node.children.filter((c) => {
          return (
            c.type === 'property' &&
            [
              'color',
              'background',
              'background-color',
              'font-family',
              'line-height',
            ].includes(c.name.toLowerCase())
          );
        }).length > 0;
      return !shouldRemove;
    });

    const visuallessCss = sast.stringify(filteredCssAst);
    const className = `alpine-css-${hash(node.properties.style)}`;
    var classList = ClassList(node);
    classList.add(className);

    originalStylesheet.push(`.${className} { ${node.properties.style} }`);
    stylesheet.push(`.${className} { ${visuallessCss} }`);

    const { style, ...propertiesWithoutStyle } = node.properties;
    return {
      ...node,
      properties: {
        ...propertiesWithoutStyle,
      },
    };
  }
  return node;
});

console.log(JSON.stringify(styleRemoved));
// console.log(toHtml(styleRemoved))
// console.log(csso.minify(stylesheet.join('\n')).css)
// console.log(originalStylesheet.join('\n'));
