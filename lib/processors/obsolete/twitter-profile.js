
/**
 * Dependencies
 */

const htmlParser = require('magnet-html-parser/lib/parse');
const toDom = require('magnet-html-parser/lib/html-parser');
const debug = require('debug')('twitter-profile');
const PATH = require('path');
const url = require('url');

module.exports = function(res) {
  const doc = toDom(res.body);

  return htmlParser(doc, res, ['icon', 'manifest'])
    .then(result => {
      debug('parsed', result);
      const twitter = parse(doc, res);
      result.type = 'profile';
      result.twitter = twitter;
      result.title = twitter.avatar.alt;
      result.description = twitter.bio;
      result.image = twitter.avatar.src;
      result.icon = twitter.avatar_small.src;
      return result;
    });
};

function parse(doc, res) {
  const result = {};

  try {
    const links = doc.querySelectorAll('link[rel="alternate"]');
    if (links.length) {
      for (let linkId = 0; linkId < links.length; linkId++) {
        const link = links[linkId];
        if (link.href.startsWith('android-app')) {
          result.android_uri = link.href;
          break;
        }
      }
    }

    const miniImage = doc.querySelector('.ProfileCardMini-avatarImage');
    if (miniImage) {
      result.avatar_small = {
        src: miniImage.src,
        alt: miniImage.alt
      };
    }

    const normalImage = doc.querySelector('.ProfileAvatar-image');
    if (normalImage) {
      result.avatar = {
        src: normalImage.src,
        alt: normalImage.alt
      };
    }

    const userData = doc.querySelector('.ProfileHeaderCard-bio');
    if (userData) {
      result.bio = userData.textContent;
    }

    const profileBannerImage = doc.querySelector('.ProfileCanopy-headerBg img');
    if (profileBannerImage) {
      const bannerImageUrl = url.parse(profileBannerImage.src);
      const path = bannerImageUrl;
      const dirname = PATH.dirname(path.pathname);

      bannerImageUrl.pathname = PATH.format({
        root: '/',
        dir: dirname,
        base: 'mobile'
      });

      result.profile_banner = {
        normal: profileBannerImage.src,
        mobile: url.format(bannerImageUrl)
      };
    }

    if (result.user_id) {
      result.follow_url = url.format({
        protocol: 'https',
        slashes: true,
        host: 'twitter.com',
        pathname: '/intent/follow',
        query: { 'screen_name': result.user_id }
      });
    }
  } catch(e) {
    // eslint-disable-line no-empty
  }

  return result;
}
