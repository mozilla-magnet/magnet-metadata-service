var GooglePlayParser = {
  execute: function(url, doc, metadata) {
    if (!url.startsWith('https://play.google.com/store/apps/details')) {
      return Promise.resolve(metadata);
    }

    var android = {};

    var pkg = url.substr(url.lastIndexOf('=') + 1);
    if (pkg) {
      android.package = pkg;
    }

    if (doc.querySelector('.id-app-title')) {
      android.name = doc.querySelector('.id-app-title').textContent;
    }

    if (doc.querySelector('.cover-image')) {
      android.icon = doc.querySelector('.cover-image').src;
      if (!android.icon.startsWith('http:')) {
        android.icon = 'http:' + android.icon;
      }
    }

    if (doc.querySelector('.current-rating')) {
      android.rating = parseInt(doc.querySelector('.current-rating').style.width);
    }

    if (android !== {}) {
      metadata.android = android;
    }

    return Promise.resolve(metadata);

  }
};

module.exports = GooglePlayParser;