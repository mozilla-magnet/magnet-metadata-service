'use strict';

// Ideally this parser should create a list of triples - but it doesn't.  Instead it
// tries to structure the OG data in some meaningful way based on the defined types
//
// If a valid 'type' key exists in 'og_data' then there should be a data member
// with that name containing the relevant data:
//
// Eg:
//
// og_data ={
//   "type": "music.playlist",
//   "music.playlist": {
//     <playlist members as defined by ogp>
//   }
// }
//
// In some cases the output slightly differs from the ogp definition.  See the
// below type definitions for the variation this parser uses.

const openGraphProperties = {
  "title": String,
  "type":  String,
  "url":   String,
  "description": String,
  "locale": String,
  "locale:alternate": new TypedArray(String),
  "site_name": String,
  "image": String,
  "image:url": String,
  "image:secure_url": String,
  "image:type": String, // MIME
  "image:width": Number,
  "image:height": Number,
  "video": String,
  "video:secure_url": String,
  "video:type": String, // MIME
  "video:width": Number,
  "video:height": Number,
  "audio": String,
  "audio:secure_url": String,
  "audio:type": String, // MIME
};

const typeAliases = {
  "soundcloud:sound": "audio"
};


function TypedArray(type) {
  this.type = type;
}

// Defines properties associated with set ""
const openGraphTypes = {
  "music.song": {
    "music:duration": Number,
    "music:album": new TypedArray("music.album"),
    "music:album:disc": Number,
    "music:album:track": Number,
    "music:musician": new TypedArray("profile")
  },
  "music.album": {
    "music:song": new TypedArray("music.song"),
    "music:song:disc": Number,
    "music:song:track": Number,
    "music:musician": new TypedArray("music.song"), // The spec says no arrays, but .. sometimes more than one artist makes an album too :
    "music:release_date": Date
  },
  "music.playlist": {
    "music:song": new TypedArray("music.song"),
    "music:song:disc": Number,
    "music:song:track": Number,
    "music:creator": "profile"
  },
  "music.radio_station": {
    "music:creator": "profile"
  },
  "video.movie": {
    "video:actor": new TypedArray("profile"),
    "video:actor:role": String,
    "video:director": new TypedArray("profile"),
    "video:writer":   new TypedArray("profile"),
    "video:duration": Number, // Seconds
    "video:release_date": Date,
    "video:tag": new TypedArray(String)
  },
  "video.episode": {
    "video:actor": new TypedArray("profile"),
    "video:actor:role": String,
    "video:director": new TypedArray("profile"),
    "video:writer":   new TypedArray("profile"),
    "video:duration": Number, // Seconds
    "video:release_date": Date,
    "video:tag": new TypedArray(String),
    "video:series": "video.tv_show"
  },
  "video.tv_show": {
    "video:actor": new TypedArray("profile"),
    "video:actor:role": String,
    "video:director": new TypedArray("profile"),
    "video:writer":   new TypedArray("profile"),
    "video:duration": Number, // Seconds
    "video:release_date": Date,
    "video:tag": new TypedArray(String)
  },
  "video.other": {
    "video:actor": new TypedArray("profile"),
    "video:actor:role": String,
    "video:director": new TypedArray("profile"),
    "video:writer":   new TypedArray("profile"),
    "video:duration": Number, // Seconds
    "video:release_date": Date,
    "video:tag": new TypedArray(String)
  },
  "article": {
    "article:published_time": Date,
    "article:modified_time": Date,
    "article:expiration_time": Date,
    "article:author": "profile",
    "article:section": String,
    "article:tag": new TypedArray(String)
  },
  "book": {
    "book:author": new TypedArray("profile"),
    "book:isbn": String,
    "book:release_date": Date,
    "book:tag": new TypedArray(String)
  },
  "profile": {
    "profile:first_name": String,
    "profile:last_name": String,
    "profile:username": String,
    "profile:gender": String  // Not thought of as an "enum" as the spec suggests
  },
  "website": {
    // Not defined
  }
};

function OpenGraphType(val) {
  let expectsCompoundData = false;


  const isValidType =
    val in openGraphTypes ||
    val === String ||
    val === Date ||
    val === Number;

  if (!isValidType) {
    throw new Error("Type: [" + val + "] is not a valid OpenGraph type");
  }

  if (val in openGraphTypes) {
    expectsCompoundData = true;
  }

  if (expectsCompoundData) {
    return {
      canBeArray: false,
      expectedProperties: openGraphTypes[val],
      primitive: false
    };
  }

  return {
    canBeArray: false,
    expectedProperties: false,
    primitive: val
  };
}

function OpenGraphArrayType(val) {
  const typeDescription = OpenGraphType(val);
  typeDescription.canBeArray = true;

  return typeDescription;
}

function annotateProperties(properties) {
  for (let key in properties) {
    const type = properties[key];
    if (type instanceof TypedArray) {
      properties[key] = OpenGraphArrayType(type.type);
    } else {
      properties[key] = OpenGraphType(properties[key]);
    }
  }
}

(function init() {
  for (let key in openGraphTypes) {
    annotateProperties(openGraphTypes[key]);
  }

  annotateProperties(openGraphProperties);
}());


function arrayPeek(arr) {
  return arr.length ? arr[arr.length - 1] : null;
}


function _parseOpenGraphDoc(doc) {
  const metaTags = doc.getElementsByTagName("meta");

  const page = {};

  let prefixChecks = [ 'og:' ];

  function startsWithPrefix(value) {
    for (let prefixIndex = 0; prefixIndex < prefixChecks.length; prefixIndex++) {
      if (value.startsWith(prefixChecks[prefixIndex])) {
        return true;
      }
    }

    return false;
  }

  let pageType = false;

  for(let tagIndex = 0; tagIndex < metaTags.length; tagIndex++) {
    const tag = metaTags[tagIndex];
    const property = tag.getAttribute('property');

    if (property && startsWithPrefix(property)) {
      const key = property.startsWith('og:') ? property.substring(3) : property;
      let value = 'malformed';

      if (tag.content) {
        value = tag.content;
      } else if (tag.hasAttribute('value')) {
        value = tag.getAttribute('value');
      }

      if (key === 'type') {

        // Add new types to the prefix check - some sites (like spotify) don't
        // add og: to the prefix once a type has been defined
        if (value in openGraphTypes) {
          console.log("Adding ",Object.keys(openGraphTypes[value]));
          pageType = value;
          prefixChecks = prefixChecks.concat(Object.keys(openGraphTypes[value]));
        } else {
          if (value in typeAliases) {
            pageType = typeAliases[value];
            value = pageType;
          } else {
            console.log("Unknown opengraph type: ", value);
          }
        }
      }

      _addKeyValueToMember(pageType, key, value, page);
    }
  }

  console.log("Page opengraph data: ");
  console.log(JSON.stringify(page, 2, 2));
  return page;
}

function _keyBelongsToType(key, openGraphType) {
  return openGraphType in openGraphTypes && key in openGraphTypes[openGraphType];
}

function _addKeyValueToMember(type, key, value, parentData, data) {
  // TODO: Add recursive add for subtypes
  if (type) {
    if (_keyBelongsToType(key, type)) {
      if (!(type in parentData)) {
        parentData[type] = {};
      }

      if (key in parentData[type] && !Array.isArray(parentData[type][key])) {
        if (_openGraphPropertyIsArray(type, key)) {
          parentData[type][key] = [value];
        } else {
          parentData[type][key] = value;
        }
      } else {
        if (Array.isArray(parentData[type][key])) {
          parentData[type][key].push(value);
        } else {
          parentData[type][key] = value;
        }
      }

      return;
    } else {
      // Check if the key belongs to a subtype
    }
  }

  if (_openGraphPropertyIsArray(key)) {
    if (key in parentData) {
      parentData[key].push(value);
    } else {
      parentData[key] = [value];
    }
  } else {
    parentData[key] = value;
  }

}

function _openGraphPropertyIsArray(type, property) {
  if (type in openGraphTypes) {
    if (property in openGraphTypes[type]) {
      return openGraphTypes[type][property].canBeArray;
    }
  }

  return property in openGraphProperties &&  openGraphProperties[property].canBeArray;
}

const OpenGraphParser = {
  execute: function(url, doc, metadata) {
    const og_data = _parseOpenGraphDoc(doc);

    if (Object.keys(og_data).length > 0) {
      metadata.og_data = og_data;
    }

    return Promise.resolve(metadata);
  }
};

module.exports = OpenGraphParser;
