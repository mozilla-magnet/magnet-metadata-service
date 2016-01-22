const express = require('express');
const config = require('./config.js');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post(/^\/metadata(\/)?$/, function(req, res) {
  const requestBody = req.body;

  if (!validatePostRequest(req, res)) {
    return;
  }

  res.json(requestBody);
});

app.post(/^\/metadata\/raw(\/)?$/, function(req, res) {
  const requestBody = req.body;

  if (!validatePostRequest(req, res)) {
    return;
  }

  res.json(requestBody);
});

function validatePostRequest(req, res) {

  // If the content-type header is not 'application/json', the request body parser
  // ignores the content so it looks like an empty request.
  const validContentType = req.get("content-type").toLowerCase() == "application/json";
  if (!validContentType) {
    res.status(400);
    res.send("Request must be Content-Type: application/json");
    return false;
  }

  return true;
}

module.exports = app;
