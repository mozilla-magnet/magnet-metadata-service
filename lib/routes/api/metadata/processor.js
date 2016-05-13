'use strict';

/**
 * Dependencies
 */

var request = require('../../../utils/request');
var htmlParser = require('magnet-html-parser');
var debug = require('debug')('processor');

/**
 * Exports
 */

module.exports = function exec(url, options) {
  var adaptors = options && options.adaptors;
  var endUrl;

  debug('processing', url, options);

  // requests can optionally come with 'adaptor'
  // urls, which is an alternative endpoint
  var adaptorUrl = findAdaptorUrl(adaptors, url);
  if (adaptorUrl) {
    return exec(adaptorUrl);
  }

  return request.get(url)
    .then(res => {

      // final-url (after redirects)
      endUrl = res.request.url;
      debug('got response', endUrl);

      // requests can optionally come with 'adaptor'
      // urls, which is an alternative endpoint
      //
      // TODO: We could save some time if stop following
      // redirects automatically and instead check if the
      // redirected location matches an adaptor. This way
      // we save downloading page content we don't need.
      var adaptorUrl = findAdaptorUrl(adaptors, endUrl);
      if (adaptorUrl) {
        return exec(adaptorUrl);
      }

      var contentType = res.headers['content-type'] || 'text/html';

      // if the service returned json, we don't need to parse anything
      if (isType(contentType, 'application/json')) {
        debug('url returned json');
        return res.body;
      }

      // only handle html content from here on
      if (!isType(contentType, 'text/html')) {
        debug('unsupported content-type', contentType);
        return { error: `unsupported response type: ${contentType}` };
      }

      debug('parsing html');
      return htmlParser.parse(res.text, endUrl);
    })

    .then(json => {
      debug('parsed', json);
      json.id = json.url = json.displayUrl = endUrl;
      return json;
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
  if (!adaptors) {
    return;
  }
  var adaptor = adaptors.find(adaptor => adaptor.pattern.test(url));
  if (adaptor) {
    return `${adaptor.url}?url=${encodeURIComponent(url)}`;
  }
}
