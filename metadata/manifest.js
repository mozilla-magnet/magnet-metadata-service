const fetch = require('node-fetch');
const config = require('../config.js');

// Try to get the manifest url, in the jsdom
// api unfortunately the object document.location
// points to about:blank
function getManifestUrl(url, manifest) {
  if (manifest.startsWith('http')) {
    return manifest;
  }

  var lastSlashIndex = url.lastIndexOf('/');
  if (lastSlashIndex > 7) {
    url = url.slice(0, lastSlashIndex);
  }

  return url + '/' + manifest;
}

var ManifestParser = {
  execute: function(url, doc, metadata) {
    var manifestNode = doc.querySelector('link[rel="manifest"]');

    // Exit early if no manifest node present
    if (!manifestNode) {
      return Promise.resolve(metadata);
    }

    var manifestUrl = manifestNode.href;
    if (!manifestUrl) {
      return Promise.resolve(metadata);
    }

    return fetch(getManifestUrl(url, manifestUrl), {
      timeout: config.fetch_timeout || 3000
    }).then((response) => {
      if (response.status !== 200) {
        return Promise.reject(response.statusText);
      }
      return response.json();
    }).then((json) => {
      metadata.manifest = json;

      // Overwrite any known fields
      if (json.name) {
        metadata.description = json.name;
      }
      if (json.short_name) {
        metadata.title = json.short_name;
      }

      return metadata;
    }).catch((err) => {
      return Promise.resolve(metadata);
    });
  }
};

module.exports = ManifestParser;
