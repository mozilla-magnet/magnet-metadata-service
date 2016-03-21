
/**
 * Dependencies
 */

var debug = require('debug')('app');
var config = require('./config');
var express = require('express');
var morgan = require('morgan');

var app = module.exports = express()
  .use(morgan('combined'))
  .use('/api/v1/', require('./lib/routes/api'))

  // compatibility for google's physical-web schema
  .post(/^\/resolve-scan$/, (req, res) => res.redirect('/api/v1/metadata'))
  .use('/', require('./lib/routes/frontend'));

// start listening
const port = process.env.PORT || config.port;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  debug(`magnet service listening at http://${host}:${port}`);
});
