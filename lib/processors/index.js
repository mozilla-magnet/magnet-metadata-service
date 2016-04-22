'use strict';

/**
 * Dependencies
 */

var parseHtml = require('magnet-html-parser');
var debug = require('debug')('processor');
var request = require('../utils/request');

/**
 * Exports
 */

module.exports = function exec(url, options) {
  debug('processing', url);
  var adaptors = options && options.adaptors;

  // requests can optionally come with 'adaptor'
  // urls, which is an alternative endpoint
  var adaptorUrl = findAdaptorUrl(adaptors, url);
  if (adaptorUrl) return exec(adaptorUrl);

  return request.get(url)
    .then(res => {

      // final-url (after redirects)
      var endUrl = res.request.url;
      debug('got response', endUrl);

      // requests can optionally come with 'adaptor'
      // urls, which is an alternative endpoint
      var adaptorUrl = findAdaptorUrl(adaptors, endUrl);
      if (adaptorUrl) return exec(adaptorUrl);

      var contentType = res.headers['content-type'];

      // if the service returned json, we don't need to parse anything
      if (isType(contentType, 'application/json')) {
        debug('url returned json');
        return res.body;
      }

      // only handle html content from here on
      if (!isType(contentType, 'text/html')) {
        debug('unsupported content-type', contentType);
        throw new Error('unsupported type: ' + contentType);
      }

      return parseHtml(res.text, endUrl)
        .then(result => {
          debug('html parsed', result);
          result.id = result.url = result.displayUrl = endUrl;
          return result;
        });
    });
};

function isType(header, type) {
  return header.indexOf(type) > -1;
}

/**
 * Find an adaptor that matches
 * the final found URL.
 *
 * @param  {String} url
 * @return {(Object|undefined)}
 */
function findAdaptorUrl(adaptors, url) {
  if (!adaptors) return;
  var adaptor = adaptors.find(adaptor => adaptor.pattern.test(url));
  if (adaptor) return `${adaptor.url}?url=${url}`;
}
