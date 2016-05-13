
/**
 * Dependencies
 */

const express = require('express');

module.exports = express()
  .get('/', (req, res) => res.redirect('https://github.com/arcturus/pw-ws'));
