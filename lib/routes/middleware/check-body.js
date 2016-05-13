
module.exports = function(req, res, next) {
  if (!hasValidParameters(req.body)) {
    res.status(400);
    return next(new Error('invalid parameters'));
  }

  req.magnet = {
    adaptors: inflateAdaptors(req.body.adaptors)
  };

  next();
};

function inflateAdaptors(adaptors) {
  return (adaptors || [])
    .filter(adaptor => adaptor.pattern)
    .map(adaptor => {
      adaptor.pattern = new RegExp(adaptor.pattern);
      return adaptor;
    });
}

function hasValidParameters(body) {
  return body
    && body.objects
    && Array.isArray(body.objects);
}
