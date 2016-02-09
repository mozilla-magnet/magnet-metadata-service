var config = require('./config.js'),
    express = require('express'),
    api = require('./api.js'),
    fe = require('./fe.js'),
    morgan = require('morgan'),
    logger = require('./utils/logger.js');

var app = express();

app.use(morgan('combined'));

// REST api
var APIEndPoint = '/api/v1/';
app.use(APIEndPoint, api);
// Compatibility layer
api.addCompatibilityLayer(app);

// Frontend api
var FEEndPoint = '/';
app.use(FEEndPoint, fe);

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  logger.info(`Physical-Web service listening at http://${host}:${port}`);

});
