'use strict';

/**
 * Dependencies
 */

const debug = require('debug')('magnet-metadata-service:processor');
const request = require('../../../utils/request');
const htmlParser = require('magnet-html-parser');

const types = {
  json: 'application/json',
  html: 'text/html'
};

/**
 * Exports
 */

module.exports = function(url, options) {
  debug('process', url, options);
  return exec(url, options)
    .then(json => {
      debug('parsed', json);
      json.originalUrl = url;
      return json;
    });
};

/**
 * Unwraps the request applying any
 * matched adaptors at each layer.
 *
 * @param  {String} url
 * @param  {String} options.adaptors
 * @return {Promise}
 */
function exec(url, options) {
  const unadaptedUrl = options && options.unadaptedUrl;
  const adaptors = options && options.adaptors;
  let endUrl;

  // requests can optionally come with 'adaptor'
  // urls, which is an alternative endpoint
  const adaptorUrl = findAdaptorUrl(adaptors, url);
  if (adaptorUrl) {
    return exec(adaptorUrl, { unadaptedUrl: url });
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
      const adaptorUrl = findAdaptorUrl(adaptors, endUrl);
      if (adaptorUrl) {
        return exec(adaptorUrl, { unadaptedUrl: endUrl });
      }

      const contentType = res.headers['content-type'] || types.html;

      // if the service returned json, we don't need to parse anything
      if (isType(contentType, types.json)) {
        debug('url returned json');
        return done(res.body);
      }

      // only handle html content from here on
      if (!isType(contentType, types.html)) {
        debug('unsupported content-type', contentType);
        return { error: `unsupported response type: ${contentType}` };
      }

      debug('parsing html');
      return htmlParser.parse(res.text, endUrl)
        .then(done);

      function done(json) {
        json.unadaptedUrl = unadaptedUrl || endUrl;
        json.displayUrl = decodeURIComponent(json.unadaptedUrl);
        json.id = json.url = endUrl;
        return json;
      }
    });
}

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

  debug('find adaptor url', url);
  const adaptor = adaptors.find(adaptor => adaptor.pattern.test(url));
  if (adaptor) {
    return `${adaptor.url}?url=${encodeURIComponent(url)}`;
  }
}
