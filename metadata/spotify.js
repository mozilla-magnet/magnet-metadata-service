const URL = require('url');
const QS = require('querystring');
const fetch = require('node-fetch');
const config = require('../config.js');

function getOEmbedUrl(url) {
  return "https://embed.spotify.com/oembed/?url=" + QS.escape(url);
}

const SpotifyMetadata = {

  execute: function(url, doc, metadata) {
    const parsedUrl = URL.parse(url);
    if (parsedUrl.hostname.indexOf('spotify.com') < 0) {
      return Promise.resolve(metadata);
    }

    return fetch(getOEmbedUrl(url), {
      timeout: config.fetch_timeout || 3000
    }).then((response) => {
      if (response.status !== 200) {
        return Promise.reject(response.statusText);
      }

      return response.json();
    }).then((json) => {
      metadata.embed = json;
      return metadata
    });
  }
};


module.exports = SpotifyMetadata;
