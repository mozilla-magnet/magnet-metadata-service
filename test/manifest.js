'use strict';

var request = require('supertest');
var app = require('../api.js');
var assert = require('chai').assert;

var manifestSites = {
  objects: [
    {
      url: 'https://twitter.com/wilsonpage'
    }
  ]
};

describe('Manifest parser', () => {
  it('should extract manifest information', (done) => {
    request(app)
      .post('/metadata/')
      .send(manifestSites)
      .expect(200)
      .end((err, response) => {
        assert.isNull(err);

        var result = JSON.parse(response.text);
        assert.lengthOf(result, 1);

        result = result[0];
        
        assert.isNotNull(result.manifest);
        var manifest = result.manifest;

        assert.equal(manifest.name, 'Twitter');
        assert.equal(manifest.short_name, 'Twitter');

        done();
      });
  });
  it('should not be present for sites without manifest', (done) => {
    var noManifestSites = Object.assign({}, manifestSites);
    noManifestSites.objects[0].url = 'https://www.mozilla.org';

    request(app)
      .post('/metadata')
      .send(noManifestSites)
      .expect(200)
      .end((err, response) => {
        assert.isNull(err);

        var result = JSON.parse(response.text);
        assert.lengthOf(result, 1);

        result = result[0];
        assert.notOk(result.manifest);

        done();             
      })
  });
});