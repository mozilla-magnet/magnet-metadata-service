
module.exports = function(req, res, next) {
  if (!req.body || !req.body.objects || !Array.isArray(req.body.objects)) {
    res.status(400);
    return res.send('invalid parameters');
  }

  next();
};
