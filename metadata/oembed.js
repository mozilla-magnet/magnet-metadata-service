'use strict';
const fetch = require('node-fetch');
const config = require('../config.js');
const xml2js = require('xml2js');
const logger = require('../utils/logger.js');

function getOEmbedUrl(url, oembed) {
  if (oembed.startsWith('http')) {
    return oembed;
  }

  var lastSlashIndex = url.lastIndexOf('/');
  if (lastSlashIndex > 7) {
    url = url.slice(0, lastSlashIndex);
  }

  if (url.endsWith('/')) {
    url += '/';
  }

  return url + oembed;
}

const oEmbedParser = {
  execute: function(url, doc, metadata) {

    const jsonEmbed = doc.querySelector('link[type="application/json+oembed"]');

    if (jsonEmbed) {
      return fetch(getOEmbedUrl(url, jsonEmbed.href), {
        timeout: config.fetch_timeout || 3000
      }).then((response) => {
        if (response.status !== 200) {
          return Promise.reject(response.statusText);
        }

        return response.json();
      }).then((json) => {
        metadata.embed = json;
        return metadata;
      });
    } else {
      const xmlEmbed = doc.querySelector('link[type="text/xml+oembed"]');

      if (!xmlEmbed) {
        return metadata;
      }

      return fetch(getOEmbedUrl(url, xmlEmbed.href), {
        timeout: config.fetch_timeout || 3000
      }).then((response) => {
        if (response.status !== 200) {
          return Promise.reject(reponse.statusText);
        }

        return response.text();
      }).then((responseText) => {
        return new Promise((resolve, reject) => {
          xml2js.parseString(responseText, function(err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      }).then((parsedDoc) => {
        const oembed = parsedDoc.oembed;
        const cleanedOEmbed = Object.keys(oembed).reduce((data, key) => {
          data[key] = oembed[key][0];
          return data;
        }, {});
        logger.debug(`Oembed information: ${cleanedOEmbed}`);

        metadata.embed = cleanedOEmbed;
        return metadata;
      });
    }
  }
};

module.exports = oEmbedParser;

