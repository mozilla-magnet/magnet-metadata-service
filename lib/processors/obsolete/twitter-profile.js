
/**
 * Dependencies
 */

var htmlParser = require('magnet-html-parser/lib/parse');
var toDom = require('magnet-html-parser/lib/html-parser');
var debug = require('debug')('twitter-profile');
var PATH = require('path');
var url = require('url');

module.exports = function(res) {
  var doc = toDom(res.body);

  return htmlParser(doc, res, ['icon', 'manifest'])
    .then(result => {
      debug('parsed', result);
      var twitter = parse(doc, res);
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
  var result = {};

  try {
    var links = doc.querySelectorAll('link[rel="alternate"]');
    if (links.length) {
      for (var linkId = 0; linkId < links.length; linkId++) {
        var link = links[linkId];
        if (link.href.startsWith('android-app')) {
          result.android_uri = link.href;
          break;
        }
      }
    }

    var miniImage = doc.querySelector('.ProfileCardMini-avatarImage');
    if (miniImage) {
      result.avatar_small = {
        src: miniImage.src,
        alt: miniImage.alt
      };
    }

    var normalImage = doc.querySelector('.ProfileAvatar-image');
    if (normalImage) {
      result.avatar = {
        src: normalImage.src,
        alt: normalImage.alt
      };
    }

    var userData = doc.querySelector('.ProfileHeaderCard-bio');
    if (userData) {
      result.bio = userData.textContent;
    }

    var profileBannerImage = doc.querySelector('.ProfileCanopy-headerBg img');
    if (profileBannerImage) {
      var bannerImageUrl = url.parse(profileBannerImage.src);
      var path = bannerImageUrl;
      var dirname = PATH.dirname(path.pathname);

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
