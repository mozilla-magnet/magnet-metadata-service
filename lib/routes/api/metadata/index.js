'use strict';

/**
 * Dependencies
 */

var process = require('./processor');

/**
 * Exports
 */

module.exports = function(req, res, next) {
  var items = req.body.objects;
  var tasks = items.map(item => {
    return process(item.url, { adaptors: req.magnet.adaptors})
      .catch(err => {
        return { error: err.message };
      });
  });

  Promise.all(tasks)
    .then((data) => res.json(data))
    .catch(next);
};
