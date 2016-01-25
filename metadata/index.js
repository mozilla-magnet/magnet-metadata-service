const fetch = require('node-fetch');
const parser = require('./parser.js');
const jsdom = require('jsdom').jsdom;

/**
 * Wrapper around the function fetchAndParse that adds
 * two methods for pre and post processing
 */
function process(url) {
  return preProcess(url).then((preResult) => {
    if (preResult) {
      return Promise.resolve(preResult);
    }

    return fetchAndParse(url);
  }).then((metadata) => {
    return postProcess(url, metadata).then((result) => {
      return Promise.resolve(result);
    });
  });
}

function preProcess(url) {
  return Promise.resolve(null);
}

function postProcess(url, data) {
  return Promise.resolve(data);
}

/**
 * Given a url string, fetch the contents and tryies to build a jsdom
 * object with the result to send it to the parsing module.
 */
function fetchAndParse(url) {
  return fetch(url).then((res) => {
    if (res.status !== 200) {
      return null;
    }

    return new Promise((resolve) => {
      res.text().then((dom) => {
        var doc = jsdom(dom, {
          'userAgent': 'Gecko Like ;)'
        });
        resolve(doc);
      });
    });
  }).then((doc) => {
    return parser.parse(url, doc);
  }).catch((err) => {
    console.info('Error parsing url ', url, ':: ', err);
  });
}

function refresh(url) {
  return Promise.resolve(true);
}

module.exports = {
  process,
  refresh
};
