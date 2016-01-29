'use strict';
const URL = require('url');
const QS = require('querystring');
const fetch = require('node-fetch');
const config = require('../config.js');

const configuredOEmbedServices = {
  "spotify.com": {
    endpoint: "https://embed.spotify.com/oembed/?url=%s",
    format: "json"
  },
  "instagram.com": {
    endpoint: "https://api.instagram.com/oembed/?url=%s",
    format: "json"
  }
};

function getOEmbedUrl(url) {
  const parsedUrl = URL.parse(url);
  const configuredDomains = Object.keys(configuredOEmbedServices);

  for (let domainIndex = 0; domainIndex < configuredDomains.length; domainIndex++) {
    const key = configuredDomains[domainIndex];
    console.log(key, "   ", parsedUrl.hostname);
    if (parsedUrl.hostname.indexOf(key) >= 0) {
      return configuredOEmbedServices[key].endpoint.replace("%s", QS.escape(url));
    }
  }

  return false;
}

const OEmbedService = {

  execute: function(url, doc, metadata) {

    const oEmbedUrl = getOEmbedUrl(url);
    if (!oEmbedUrl) {
      return Promise.resolve(metadata);
    }

    return fetch(oEmbedUrl, {
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


module.exports = OEmbedService;
