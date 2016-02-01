const express = require('express');
const config = require('./config.js');
const bodyParser = require('body-parser');
const metadataParser = require('./metadata');

const app = express();

app.use(bodyParser.json());

app.use(function(req, res, next) {
  if (req.method == 'POST') {
    if (validatePostRequest(req, res)) {
      next();
    }
    return;
  }

  next();
});

function processRequest(req, res, next) {
  const requestBody = req.body;
  if (!requestBody || !requestBody.objects ||
     !Array.isArray(requestBody.objects)) {
    res.status(400);
    res.send('Invalid parameters');
    return false;
  }

  const tasks = requestBody.objects.map((task) => {
    return metadataParser.process(task.url);
  });

  Promise.all(tasks).then((parsedData) => {
    res.json(parsedData);
  }).catch(err => {
    next(err);
  });
}

app.post(/^\/metadata(\/)?$/, function(req, res, next) {
   processRequest(req, res, next);
});

app.post(/^\/metadata\/raw(\/)?$/, function(req, res, next) {
  // So far there is no difference with the previous method.
  processRequest(req, res, next);
});

app.post(/^\/metadata\/refresh$/, function(req, res, next) {
  // Since we don't have caching system yet, this is a mock.
  res.json({});
});

/**
 * Compatibility layer
 */
 app.addCompatibilityLayer = function(mainApp) {
  mainApp.post(/^\/resolve-scan$/, function(req, res, next) {
    processRequest(req, res, next);
  });
  mainApp.post(/^\/refresh-url$/, function(req, res, next) {
    res.json({});
  });
 }

// TODO: install a middleware to handle any request that doesnt end up properly

function validatePostRequest(req, res) {

  // If the content-type header is not 'application/json', the request body parser
  // ignores the content so it looks like an empty request.
  const validContentType = req.get('content-type').toLowerCase().indexOf('application/json') > -1;
  if (!validContentType) {
    res.status(400);
    res.send('Request must be Content-Type: application/json');
    return false;
  }

  return true;
}

module.exports = app;
