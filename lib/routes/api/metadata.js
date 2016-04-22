'use strict';

/**
 * Dependencies
 */

var process = require('../../processors');

/**
 * Exports
 */

module.exports = function(req, res, next) {
  var items = req.body.objects;
  var tasks = items.map(item => process(item.url, {
    adaptors: req.magnet.adaptors
  }));

  Promise.all(tasks)
    .then((data) => res.json(data))
    .catch(next);
};
