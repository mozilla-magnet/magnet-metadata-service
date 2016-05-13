#! /usr/bin/env node

/**
 * Dependencies
 */

const exec = require('../lib/routes/api/metadata/processor');

const urls = process.argv.slice(2);

Promise.all(urls.map(url => exec(url)))
  .then(result => {
    console.log(result); // eslint-disable-line no-console
    process.exit(0);
  })

  .catch(err => {
    console.error(`Error: ${err.stack}`); // eslint-disable-line no-console
    process.exit(0);
  });
