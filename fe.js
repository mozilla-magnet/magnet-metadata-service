var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.redirect('https://github.com/arcturus/pw-ws');
});

module.exports = app;