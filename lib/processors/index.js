'use strict';

/**
 * Dependencies
 */

var parseContentType = require('content-type').parse;
var parseHtml = require('magnet-html-parser');
var ua = require('../../config').user_agent;
var debug = require('debug')('processor');
var request = require('superagent');

/**
 * Exports
 */

module.exports = function(url) {
  debug('processing', url);
  return get(url)
    .then(res => {
      var type = getType(res);
      if (type !== 'text/html') throw new Error('unsupported type: ' + type);

      // final url (after redirects)
      var endUrl = res.request.url;

      return parseHtml(res.text, endUrl)
        .then(result => {
          result.id = result.url = result.displayUrl = endUrl;
          return result;
        });
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
