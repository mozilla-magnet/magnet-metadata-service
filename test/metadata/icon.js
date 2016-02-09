'use strict';

var request = require('supertest');
var app = require('../../api.js');
var assert = require('chai').assert;

var iconSites = {
  objects: [
    {
      url: 'http://realfavicongenerator.net/'
    }
  ]
};

var noIconSites = {
  objects: [
    {
      url: 'http://www.bbc.co.uk/'
    }
  ]
}

describe('Icons', () => {
  it('should return the fav icon if present', (done) => {
    request(app)
      .post('/metadata/')
      .send(iconSites)
      .expect(200)
      .end((err, response) => {
        assert.isNull(err);

        var result = JSON.parse(response.text);
        assert.lengthOf(result, 1);

        result = result[0];
        assert.ok(result.icon);

        done();
      });
  });

  it('should return several icons if present', (done) => {
    request(app)
      .post('/metadata/')
      .send(iconSites)
      .expect(200)
      .end((err, response) => {
        assert.isNull(err);

        var result = JSON.parse(response.text);
        assert.lengthOf(result, 1);

        result = result[0];
        assert.ok(result.icons);
        assert.ok(result.icons.length > 0);

        done();
      });
  });

  it('should return extra information if present', (done) => {
    request(app)
      .post('/metadata/')
      .send(iconSites)
      .expect(200)
      .end((err, response) => {
        assert.isNull(err);

        var result = JSON.parse(response.text);
        assert.lengthOf(result, 1);

        result = result[0];
        
        var extraInfoPresent = result.icons.some((icon) => {
          return icon.size || icon.color;
        });
        assert.ok(extraInfoPresent);

        done();
      });
  });

  it('should not be present if no icon information', (done) => {
    request(app)
      .post('/metadata')
      .send(noIconSites)
      .expect(200)
      .end((err, response) => {
        assert.isNull(err);

        var result = JSON.parse(response.text);
        assert.lengthOf(result, 1);

        result = result[0];
        assert.notOk(result.icon);
        assert.notOk(result.icons);

        done();
      });
  });
});