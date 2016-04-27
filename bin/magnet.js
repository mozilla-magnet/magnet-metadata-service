#! /usr/bin/env node

/**
 * Dependencies
 */

var exec = require('../lib/routes/api/metadata/processor');

var urls = process.argv.slice(2);

Promise.all(urls.map(url => exec(url)))
  .then(result => {
    console.log(result);
    process.exit(0);
  })

  .catch(err => {
    console.error('Error: ' + err.stack);
    process.exit(0);
  });
