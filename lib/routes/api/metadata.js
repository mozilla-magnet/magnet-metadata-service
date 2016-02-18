
/**
 * Dependencies
 */

var process = require('../../processors');

/**
 * Exports
 */

module.exports = function(req, res, next) {
  var tasks = req.body.objects.map((item) => process(item.url));

  Promise.all(tasks)
    .then((parsedData) => res.json(parsedData))
    .catch(next);
};
