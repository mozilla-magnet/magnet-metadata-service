
/**
 *
 * @type {Array}
 */
var parsers = [
  {
    regex: /twitter\.com\/.+$/,
    parse: require('./twitter-profile')
  },
  {
    regex: /play\.google\.com\/store\/apps\/details/,
    parse: require('./google-play-profile')
  },
  {
    regex: /./,
    parse: require('magnet-html-parser')
  }
];

module.exports = function(response) {
  return find(response.url).parse(response);
};

function find(url) {
  return parsers.find(parser => parser.regex.test(url));
}
