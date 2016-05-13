
/**
 * Dependencies
 */

const express = require('express');
const morgan = require('morgan');

module.exports = express()
  .use(morgan('combined'))
  .use('/api/v1/', require('./lib/routes/api'))

  // compatibility for google's physical-web schema
  .post(/^\/resolve-scan$/, (req, res) => res.redirect('/api/v1/metadata'))
  .use('/', require('./lib/routes/frontend'));
