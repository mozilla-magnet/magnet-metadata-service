
/**
 * Dependencies
 */

var checkBody = require('../middleware/check-body');
var bodyParser = require('body-parser');
var metadata = require('./metadata');
var express = require('express');

/**
 * Sub-app to handle `api/` routes
 *
 * @type {Object}
 */
var app = module.exports = express();

app.use(bodyParser.json());
app.use(require('../middleware/validate-post'));

app.post(/^\/metadata(\/)?$/, checkBody, metadata);
app.post(/^\/metadata\/raw(\/)?$/, checkBody, metadata);

// Since we don't have caching system yet, this is a mock.
app.post(/^\/metadata\/refresh$/, function(req, res) {
  res.json({});
});
