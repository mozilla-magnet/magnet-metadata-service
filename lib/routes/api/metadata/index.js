'use strict';

/**
 * Dependencies
 */

const process = require('./processor');

/**
 * Exports
 */

module.exports = function(req, res, next) {
  const items = req.body.objects;
  const tasks = items.map(item => {
    return process(item.url, { adaptors: req.magnet.adaptors})
      .catch(err => {
        return { error: err.message };
      });
  });

  Promise.all(tasks)
    .then((data) => res.json(data))
    .catch(next);
};
