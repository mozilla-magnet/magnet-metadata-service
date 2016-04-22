
module.exports = function(req, res, next) {
  if (!req.body || !req.body.objects || !Array.isArray(req.body.objects)) {
    res.status(400);
    return res.send('invalid parameters');
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
