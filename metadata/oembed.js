const fetch = require('node-fetch');
const config = require('../config.js');

const oEmbedParser = {
  execute: function(url, doc, metadata) {

    const jsonEmbed = doc.querySelector('link[type="application/json+oembed"]');

    if (jsonEmbed) {
      return fetch(jsonEmbed.href, {
        timeout: config.fetch_timeout || 3000
      }).then((response) => {
        if (response.status !== 200) {
          return Promise.reject(response.statusText);
        }

        return response.json();
      }).then((json) => {
        metadata.embed = json;
        return Promise.resolve(metadata);
      });
    } else {
      // TODO: XML embed
      return Promise.resolve(metadata);
    }
  }
};

module.exports = oEmbedParser;

