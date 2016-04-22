
/**
 * Dependencies
 */

var config = require('./config');
var app = require('./app');

// start listening
const port = process.env.PORT || config.port;
const address = process.env.ADDRESS || config.address || '';
var server = app.listen(port, address, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(`magnet service listening at http://${host}:${port}`);
});