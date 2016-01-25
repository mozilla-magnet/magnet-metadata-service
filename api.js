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

app.post(/^\/metadata(\/)?$/, function(req, res, next) {
  const requestBody = req.body;
  if (!requestBody.objects || !Array.isArray(requestBody.objects)) {
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
    next();
  }); 
});

app.post(/^\/metadata\/raw(\/)?$/, function(req, res) {
  const requestBody = req.body;
  res.json(requestBody);
});

app.post(/^\/metadata\/refresh$/, function(req, res) {
  const requestBody = req.body;
  res.json(requestBody);
});

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
