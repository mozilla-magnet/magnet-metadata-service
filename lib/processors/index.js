
/**
 * Dependencies
 */

var debug = require('debug')('processor');
var parseContentType = require('content-type').parse;
var ua = require('../../config').user_agent;
var request = require('superagent');

/**
 * Supported content-type processors.
 *
 * @type {Object}
 */
var contentProcessors = {
  'text/html': require('./text-html'),
  'text/calendar': require('./text-calendar')
};

/**
 * Exports
 */

module.exports = function(url) {
  debug('processing', url);
  return get(url)
    .then(res => {
      var type = getType(res);
      var processor = contentProcessors[type];

      if (!type) throw new Error('unknown type: ' + type);

      // final url
      url = res.request.url;

      return processor({
        url: url,
        body: res.text
      });
    })

    .then(result => {
      result.id = result.url = result.displayUrl = url;
      return result;
    });
};

function get(url) {
  return new Promise((resolve, reject) => {
    request
      .get(url)
      .buffer()
      .set('User-Agent', ua)
      .end((err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
  });
}

function getType(res) {
  var raw = res.header['content-type'];
  return raw
    ? parseContentType(raw).type
    : 'text/html';
}
