
/**
 * Exports
 */

module.exports = function(req, res, next) {
  if (req.method !== 'POST') return next();

  // If the content-type header is not
  // 'application/json', the request
  // body parser ignores the content
  // so it looks like an empty request.
  var validContentType = req
    .get('content-type')
    .toLowerCase()
    .indexOf('application/json') > -1;

  if (!validContentType) {
    res.status(400);
    return res.send('Request must be Content-Type: application/json');
  }

  next();
};
