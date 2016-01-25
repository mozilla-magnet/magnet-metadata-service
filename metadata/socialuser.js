'use strict';
const URL = require('url');
const PATH = require('path');

// Given a URL to a Social Media website, determine information about the User
// the URL relates to if any
const SocialUserParser = {
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

        const profileBannerImage = doc.querySelector('.ProfileCanopy-headerBg img');

        if (profileBannerImage) {
          const bannerImageUrl = URL.parse(profileBannerImage.src);
          const path = bannerImageUrl;
          const dirname = PATH.dirname(path.pathname);

          bannerImageUrl.pathname = PATH.format({
            root: "/",
            dir: dirname,
            base: "mobile"
          });

          twitter.profile_banner = {
            normal: profileBannerImage.src,
            mobile: URL.format(bannerImageUrl)
          }
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

module.exports = SocialUserParser;
