/**
 * Generated by `js1 upgrade www-shared`.
 * @generated SignedSource<<7c18739c60ab8be9e5bf2e4ee60beab8>>
 *
* Copyright 2004-present Facebook. All Rights Reserved.
*
* This rule help to find unrecognized lowercased JSX tags.
*/

'use strict';

const utils = require('./utils');

module.exports = function rule(context) {
  return {
    JSXOpeningElement: function(node) {
      if (node.name.type !== 'JSXIdentifier') {
        // html tags should be just identifiers with no dots
        return;
      }
      var tagName = node.name.name;
      if (!tagName.match(/^[a-z]/)) {
        // html tags should start with lowercase letter
        return;
      }
      if (supportedTags.has(tagName)) {
        // name of the tag is in the list of supported tags
        return;
      }
      if (
          tagName === 'fbt' &&
          utils.getBinding(context.getScope(), tagName) !== null
      ) {
        // FB-ONLY: Ignore fbt if it is bound
        return;
      }
      context.report(
        node,
        'Unrecognized JSX tag. If you believe that this tag is supported ' +
        'consider adding it to the list of recognized tags in configuration ' +
        'of this rule.'
      );
    },
  };
};

// lists all tags known to be supported by React
// this list it taken from the list of DOM factories in
// https://github.com/facebook/react/blob/master/src/isomorphic/classic/element/ReactDOMFactories.js
const supportedTags = new Set([
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'big',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'menuitem',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
  // SVG
  'circle',
  'clipPath',
  'defs',
  'ellipse',
  'g',
  'image',
  'line',
  'linearGradient',
  'mask',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'stop',
  'svg',
  'text',
  'tspan',
]);
