'use strict';
const URL = require('url');

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

// Given a URL to a Social Media website, determine information about the User
// the URL relates to if any
var SocialUserParser = {
  parsers: {
    "twitter.com": function(url, doc, metadata) {
      const twitter = {};
      const parsedUrl = URL.parse(url);
      const dirs = parsedUrl.pathname.split("/").filter(dirComponent => dirComponent.length);

      if (dirs.length === 1) {
        twitter.user_id = dirs[0]
      }

      try {
        const links = doc.querySelectorAll('link[rel="alternate"]');
        if (links) {
          for (let linkId = 0; linkId < links.length; linkId++) {
            const link = links[linkId];
            if (link.href.startsWith("android-app")) {
              twitter.android_uri = link.href;
              break;
            }
          }
        }

        const miniImage = doc.querySelector('.ProfileCardMini-avatarImage');
        if (miniImage) {
          twitter.avatar_small = {
            src: miniImage.src,
            alt: miniImage.alt
          };
        }

        const normalImage = doc.querySelector('.ProfileAvatar-image');
        if (normalImage) {
          twitter.avatar = {
            src: normalImage.src,
            alt: normalImage.alt
          };
        }

        const userData = doc.querySelector('.ProfileHeaderCard-bio');

        if (userData) {
          twitter.bio = userData.textContent;
        }

      } catch(e) {
      }

      metadata.twitter = twitter;
      return Promise.resolve(metadata);
    }
  },
  execute: function(url, doc, metadata) {
    const parsedUrl = URL.parse(url);
    if (parsedUrl.hostname in this.parsers) {
      return Promise.resolve(this.parsers[parsedUrl.hostname].apply(this, arguments));
    } else {
      return Promise.resolve(metadata);
    }
  }
};


module.exports = {
  parse: function parse(url, doc) {
    var parsers = [SimpleParser, SocialUserParser];

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

    // Check if we need to add the w3c manifest parser
    if (doc.querySelector('link[rel="manifest"]')) {
      const ManifestParser = require('./manifest.js');
      parsers.push(ManifestParser);
    }

    return parsers.reduce((current, next) => {
      return current.then((metadata) => {
        return next.execute(url, doc, metadata);
      });
    }, Promise.resolve({}));
  }
};
