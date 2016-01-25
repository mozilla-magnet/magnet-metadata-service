# Physical Web Web Service
This implementation pretends to be compatible with the original web service [provided by Google](https://github.com/google/physical-web/tree/master/web-service), so keeps the API interface.

# API

## POST /api/v1/metadata
Returns the metadata associated to a list of urls passed in the body of the request.

The metadata server will try to inherit what kind of url (if possible) are we refering too. And will return a basic set of meta information, plus extra fields related to the kind of url.

The service as well will omit metainformation extracted that consider not relevant.

+ Request body
```
  {
    "objects": [
      {"url": "<physical url>"},...
    ]
  }
```

### Twitter Metadata

If the URL requested is a Twitter user page, the response will contain a
'twitter' key containing the following data:

+ Twitter User Metadata
```
"twitter": {
  "user_id": "twitter_handle",
  "bio": "twitter bio for user",
  "android_uri": "android-app://url-to-user-in-app",
  "avatar" { "src": "url", "alt": "alt text" },
  "avatar_small": { "src": "url", "alt": "alt text" }
  "profile_banner": {
    "normal": "url",
    "mobile": "url"
  },
  "follow_url": "follow intent url"
}
```

## POST /api/v1/metadata/raw
Same than method above, but will return any metadata found in the document.

## POST /api/v1/metadata/refresh
Given an array of urls passed on the request body, refresh the stored metadata for those elements.

Returns inmediately

+ Request body
```
  ["<physical url 1>", "<physical url 2>", ...]
```

## Legacy API

### POST /resolve-scan
Same than method `/api/v1/metadata`

### POST /refresh-url
Same than method `/api/v1/metadata/refresh` but admits just one url via `url` query parameter.

### GET /favicon
Not implemented (yet)
