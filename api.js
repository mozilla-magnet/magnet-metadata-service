var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

module.exports = app;