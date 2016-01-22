var config = require('./config.js'),
    express = require('express'),
    api = require('./api.js'),
    fe = require('./fe.js');

var app = express();

// REST api
var APIEndPoint = '/api/v1/';
app.use(APIEndPoint, api);

// Frontend api
var FEEndPoint = '/';
app.use(FEEndPoint, fe);

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Physical-Web service listening at http://%s:%s', host, port);
});
