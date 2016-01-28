const ManifestParser = require('./manifest.js');
const SocialUserParser = require('./socialuser.js');
const IconParser = require('./icon.js');
const AndroidParser = require('./googleplay.js');
const OpenGraphParser = require('./opengraph.js');
const OEmbedParser = require('./oembed.js');

var SimpleParser = {
  execute: function(url, doc, metadata) {
    return new Promise((resolve, reject) => {
      if (doc === null) {
        return {};
      }

      metadata = metadata || {};

      metadata.id = url;
      metadata.url = url;
      metadata.displayUrl = url;

      try {
        if (doc.querySelector('title')) {
          metadata.title = doc.querySelector('title').textContent;
        }
        if (doc.querySelector('meta[name="description"]')) {
          metadata.description = doc.querySelector('meta[name="description"]').content;
        }
        if (!metadata.description) {
          // Cheap description extraction from the body contents
          var content = doc.body.textContent.replace(/(<([^>]+)>)/ig,"").trim();

          var description = content.length > 256 ? content.substr(256) : content;

          metadata.description = description;
        }

        resolve(metadata);
      } catch(e) {
        reject(e);
      }
    });
  }
};

module.exports = {
  parse: function parse(url, doc) {
    var parsers = [SimpleParser, ManifestParser, SocialUserParser, IconParser,
      AndroidParser, OpenGraphParser, OEmbedParser];

    // Add other parsers on demand, they will execute in waterfall mode
    // if (url.contains('youtube')) {
    //   parsers.push(YouTubeParser)
    // }
    // Below you have a simple example:

    parsers.push({
      execute: function(url, doc, metadata) {
        metadata.watermark = {
          time: Date.now()
        };
        return Promise.resolve(metadata);
      }
    });

    return parsers.reduce((current, next) => {
      return current.then((metadata) => {
        return next.execute(url, doc, metadata);
      });
    }, Promise.resolve({}));
  }
};
