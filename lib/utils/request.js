'use strict';

/**
 * NOTE: We've abstracted requests into
 * their own helper modudule so that they
 * can easily be stubbed in unit-tests.
 */

/**
 * Dependencies
 */

const ua = require('../../config').user_agent;
const request = require('superagent');

/**
 * Perform a get request.
 *
 * @param  {String} url
 * @return {Promise}
 */
exports.get = function(url) {
  return new Promise((resolve, reject) => {
    request.get(url)
      .buffer()
      .set('User-Agent', ua)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
  });
};
