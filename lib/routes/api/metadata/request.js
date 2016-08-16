'use strict';

/**
 * Dependencies
 */

const debug = require('debug')('magnet-metadata-service:request');
const parseCacheControl = require('parse-cache-control');
const config = require('../../../../config');
const URL = require('url');

const MAX_REDIRECTS = config.max_redirects;
const DEFAULT_MAX_AGE = config.default_max_age;
const protocols = {
  'https:': require('https'),
  'http:': require('http')
};

/**
 * Unwraps a request applying any
 * matched adaptors at each layer.
 *
 * @param  {String} url
 * @param  {Array} [options.adaptors]
 * @param  {Number} [options.findParams]
 * @return {Promise}
 */
module.exports = function request(url, options = {}, state = {}) {
  debug('request', url, options, state);
  if (!url) { return Promise.reject(new Error('url undefined')); }

  options.findParams = options.findParams || [];
  options.adaptors = options.adaptors || [];
  state.unadaptedUrl = state.unadaptedUrl || url;
  state.redirectCount = state.redirectCount || 0;
  state.foundParams = state.foundParams || {};

// console.log('state', state);
  const adaptorUrl = findAdaptorUrl(options.adaptors, url);

  if (adaptorUrl) {
    debug('using adaptor', adaptorUrl);
    return request(adaptorUrl, options, state);
  }

  return new Promise((resolve, reject) => {
    const parsedUrl = URL.parse(url, true);
    const protocol = protocols[parsedUrl.protocol];
    const requestOpts = parsedUrl;

    // mix any found params into the state object
    Object.assign(state.foundParams, pick(parsedUrl.query, options.findParams));

    requestOpts.headers = { 'User-Agent': config.user_agent };

    protocol.get(requestOpts, res => {
      debug('got response, %s', url);
      const status = res.statusCode;
      let text = '';

      if (isError(status)) {
        return reject(new Error(`http error ${status} - ${url}`));
      }

      if (isRedirect(status)) {
        debug('is redirect');

        // ensure the response is being consumed
        // this is required for Node v0.10+
        res.resume();

        if (state.redirectCount >= MAX_REDIRECTS) {
          return reject(new Error('max redirects reached'));
        }

        delete state.unadaptedUrl;
        state.redirectCount++;

        return request(res.headers.location, options, state)
          .then(resolve, reject);
      }

      res.setEncoding('utf8');
      res.on('data', chunk => {
        debug('data', chunk);
        text += chunk;
      });

      res.on('error', reject);
      res.on('end', () => {
        debug('res end');

        // If Cache Control headers are present,
        // and max age set, use that value to set expiry
        const cacheControl = parseCacheControl(res.headers['cache-control']) || {};

        resolve({
          // Set a default of cache time of 30 seconds to avoid
          // thundering herds DoSing the remote and saturating us.
          maxAge: (cacheControl['max-age'] || DEFAULT_MAX_AGE) * 1000,
          text: text,
          finalUrl: url,
          unadaptedUrl: state.unadaptedUrl,
          contentType: res.headers['content-type'],
          foundParams: state.foundParams
        });
      });
    })

    .on('error', reject);
  });
};

/**
 * Utils
 */

function isRedirect(code) {
  return ~[301, 302, 303, 305, 307, 308].indexOf(code);
}

function isError(code) {
  return code < 200 || code >= 400;
}

/**
 * Find an adaptor that matches
 * the final found URL.
 *
 * @param  {Array} adaptors
 * @param  {String} url
 * @return {(String|undefined)}
 */
function findAdaptorUrl(adaptors, url) {
  if (!adaptors) { return; }
  debug('find adaptor url', url);
  const adaptor = adaptors.find(adaptor => adaptor.pattern.test(url));
  if (adaptor) {
    return `${adaptor.url}?url=${encodeURIComponent(url)}`;
  }
}

function pick(object, keys) {
  return keys.reduce((result, key) => {
    if (object[key]) { result[key] = object[key]; }
    return result;
  }, {});
}
