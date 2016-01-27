function getIconUrl(url, icon) {
  if (icon.startsWith('http')) {
    return icon;
  } else if (icon.startsWith('//')) {
    return 'http:' + icon;
  }

  var lastSlashIndex = url.lastIndexOf('/');
  if (lastSlashIndex > 7) {
    url = url.slice(0, lastSlashIndex);
  }

  return url + '/' + icon;
}

var IconParser = {
  execute: function(url, doc, metadata) {
    var icons = [];

    function getIconsByType(selector) {
      if (doc.querySelectorAll(selector)) {
        [].slice.call(doc.querySelectorAll(selector), 0).forEach((iconLink) => {
          icon = {
            href: getIconUrl(url, iconLink.href)
          }
          if (iconLink.getAttribute('sizes')) {
            icon.size = iconLink.getAttribute('sizes');
          }
          if (iconLink.getAttribute('color')) {
            icon.color = iconLink.getAttribute('color');
          }
          icons.push(icon);
          metadata.icon = icon.href;
        });
      } else {
        return [];
      }
    }

    icons.concat(getIconsByType('link[rel="shortcut icon"]'));
    icons.concat(getIconsByType('link[rel="icon"]'));
    icons.concat(getIconsByType('link[rel="apple-touch-icon"]'));
    icons.concat(getIconsByType('link[rel="apple-touch-icon-precomposed"]'));
    icons.concat(getIconsByType('link[rel="mask-icon"]'));

    if (icons.length > 0) {
      metadata.icons = icons;
    }

    return Promise.resolve(metadata);
  }
};

module.exports = IconParser;
