'use strict';

/**
 * Dependencies
 */

const debug = require('debug')('magnet:route:metadata');
const process = require('./processor');

/**
 * Exports
 */

module.exports = function(req, res, next) {
  const items = req.body.objects;
  const tasks = items.map(item => {
    return process(item.url, { adaptors: req.magnet.adaptors })
      .catch(err => {
        debug('item error', err);
        return { error: err.message };
      });
  });

  Promise.all(tasks)
    .then((data) => res.json(data))
    .catch(next);
};
