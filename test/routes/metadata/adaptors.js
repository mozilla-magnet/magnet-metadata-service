'use strict';

/**
 * Dependencies
 */

var request = require('../../../lib/utils/request');
var app = require('../../../lib/routes/api');
var supertest = require('supertest');
var assert = require('assert');
var sinon = require('sinon');

var testUrl = 'https://facebook.com/wilsonpage';
var adaptorUrl = 'http://box.wilsonpage.me/magnet-facebook-adaptor';

var requestBody = {
  objects: [ { url: testUrl } ],
  adaptors: [
    {
      pattern: 'facebook\.com/.+',
      url: adaptorUrl
    }
  ]
};

describe('adaptors', () => {
  before(() => {
    sinon.stub(request, 'get');
  });

  after(() => {
    request.get.restore();
  });

  it('requests the adaptor url instead', done => {
    request.get.returns(Promise.resolve({
      request: { url: testUrl },
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: { title: 'My title' }
    }));

    supertest(app)
      .post('/metadata/')
      .send(requestBody)
      .end((err) => {
        if (err) throw err;
        sinon.assert.calledWith(request.get, adaptorUrl + '?url=' + testUrl)
        done();
      });
  });

  it('does no html-parsing if the service returns JSON', done => {
    request.get.returns(Promise.resolve({
      request: { url: testUrl },
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: { title: 'My title' }
    }));

    supertest(app)
      .post('/metadata/')
      .send(requestBody)
      .end((err, res) => {
        if (err) throw err;
        assert.deepEqual(res.body, [{ title: 'My title' }])
        done();
      });
  });

  it('does html-parsing if the service returns HTML', done => {
    request.get.returns(Promise.resolve({
      request: { url: testUrl },
      headers: { 'content-type': 'text/html; charset=utf-8' },
      text: '<title>My title</title>'
    }));

    supertest(app)
      .post('/metadata/')
      .send(requestBody)
      .end((err, res) => {
        assert.equal(res.body[0].title, 'My title');
        done();
      });
  });

  it('checks for matching adaptors after redirects', done => {
    var shortenedUrl = 'http://goo.gl/WNdChy';

    request.get.returns(Promise.resolve({
      request: { url: testUrl },
      headers: { 'content-type': 'text/html; charset=utf-8' },
      text: '<title>My title</title>'
    }));

    supertest(app)
      .post('/metadata/')
      .send(Object.assign(requestBody, {
        objects: [{ url: shortenedUrl }]
      }))

      .end((err, res) => {
        assert.equal(res.body[0].title, 'My title');
        sinon.assert.calledWith(request.get, shortenedUrl);
        sinon.assert.calledWith(request.get, adaptorUrl + '?url=' + testUrl);
        done();
      });
  });
});
