function getIconUrl(url, icon) {
  if (icon.startsWith('http')) {
    return icon;
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
    // Try first the typical 'icon'
    if (doc.querySelectorAll('link[rel="icon"]')) {
      [].slice.call(doc.querySelectorAll('link[rel="icon"]'), 0).forEach((iconLink) => {
        icon = {
          href: getIconUrl(url, iconLink.href)
        }
        if (iconLink.sizes) {
          icon.size = iconLink.sizes;
        }
        icons.push(icon);
        metadata.icon = icon.href;
      });
    }

    // Now go for the applet touch ones
    if (doc.querySelectorAll('link[rel="apple-touch-icon"]')) {
      [].slice.call(doc.querySelectorAll('link[rel="apple-touch-icon"]'), 0).forEach((iconLink) => {
        icon = {
          href: getIconUrl(url, iconLink.href)
        }
        if (iconLink.sizes) {
          icon.size = iconLink.sizes;
        }
        icons.push(icon);
        metadata.icon = icon.href;
      }); 
    }

    if (icons.length > 0) {
      metadata.icons = icons;
    }

    return Promise.resolve(metadata);
  }
};

module.exports = IconParser;