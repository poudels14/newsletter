import { Base64 } from 'js-base64';
import { Context } from 'Http';
import { Response } from 'Http';
import { knex } from 'Utils';

import unified from 'unified';
import type { Node, Parent } from 'unist';
import rehypeParse from 'rehype-parse';
import ufilter from 'unist-util-filter';
import umap from 'unist-util-map';
import toHtml from 'hast-util-to-html';
import csso from 'csso';
import { isNumber } from 'lodash';

import sast from 'sast';
import ClassList from 'hast-util-class-list';
import hash from '@emotion/hash';

const getDigestContent = async (id: string): Promise<string> => {
  const rows = await knex('user_emails')
    .select('originalContent')
    .where({ id });
  return Base64.decode(rows[0].originalContent);
};

const uparse = (html: string) => {
  return unified().use(rehypeParse).parse(html);
};

const removeVisualCss = (style: string, node?: Node) => {
  const cssPropertiesToRemove = [
    'color',
    'background',
    'background-color',
    'font-size',
    'font-family',
    'line-height',
    'text-align',
    'width',
    'max-width',
    'text-decoration',
    // TODO(sagar): need to remove width property in items that control width of the entire newsletter
  ];
  const skipList = ['img'];
  const cssAst = sast.parse(style);
  const filteredCssAst = ufilter(cssAst, (n) => {
    const shouldRemove =
      !skipList.includes(node?.tagName) &&
      n.type === 'declaration' &&
      n.children.filter((c) => {
        return (
          c.type === 'property' &&
          cssPropertiesToRemove.includes(c.name.toLowerCase())
        );
      }).length > 0;
    return !shouldRemove;
  });
  return filteredCssAst ? sast.stringify(filteredCssAst) : '';
};

const extractCssAndAddClassname = (node: Node) => {
  const nodeCss = node.properties.style;
  const visuallessCss = removeVisualCss(nodeCss, node);
  const className = `alpine-${hash(nodeCss)}`;
  const classList = ClassList(node);
  classList.add(className);

  return {
    originalStyle: `.${className} { ${nodeCss} }`,
    style: `.${className} { ${visuallessCss} }`,
  };
};

const extractStyles = (tree: Node, hashId: string) => {
  const originalStylesheet: string[] = [];
  const stylesheet: string[] = [];

  const treeWithoutCss = ufilter(tree, (node) => {
    const isStyleNode = node.type === 'element' && node.tagName === 'style';
    if (isStyleNode) {
      const stylesheetCss = node.children.map((c) => c.value || '').join('');
      originalStylesheet.push(stylesheetCss);
      stylesheet.push(removeVisualCss(stylesheetCss));
    }
    return !isStyleNode;
  });

  const cleanHtmlTree = umap(treeWithoutCss, (node) => {
    // add link to stylesheet in head
    if (node.type === 'element' && node.tagName === 'head') {
      node.children.splice(0, 1, {
        type: 'element',
        tagName: 'link',
        properties: {
          href: `/stylesheets/digests/${hashId}.css`,
          rel: 'stylesheet',
          type: 'text/css',
        },
      });
    }

    if (node.type === 'element' && node.properties?.width) {
      if (node.tagName !== 'img') {
        const width = node.properties.width;
        node.properties.style = (node.properties.style || '').concat(
          `;width: ${width}${isNumber(width) ? 'px' : ''}`
        );
        delete node.properties['width'];
      }
    }

    if (node.properties?.style) {
      const nodeStyle = extractCssAndAddClassname(node);

      originalStylesheet.push(nodeStyle.originalStyle);
      stylesheet.push(nodeStyle.style);

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

  return {
    htmlTree: cleanHtmlTree,
    originalStyle: csso.minify(originalStylesheet.join('\n')).css,
    cleanStyle: csso.minify(stylesheet.join('\n')).css,
  };
};

// Note(sagar): should only be exposed to Admins
const extractCss = async (ctxt: Context, res: Response): Promise<void> => {
  const { digestId } = ctxt.query;

  const digestContent = await getDigestContent(digestId as string);
  const htmlTree = uparse(digestContent);
  const { originalStyle, cleanStyle, htmlTree: cleanHtmlTree } = extractStyles(
    htmlTree,
    digestId
  );

  const base64Html = Base64.encode(toHtml(cleanHtmlTree));

  await knex('user_emails').where({ id: digestId }).update({
    content: base64Html,
    originalStyle,
    cleanStyle,
  });

  res.json({ originalStyle, cleanStyle, base64Html });
};

export default extractCss;
