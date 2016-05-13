'use strict';

/**
 * Dependencies
 */

const parseHtml = require('magnet-html-parser');
const app = require('../../../lib/routes/api');
const supertest = require('supertest');
const assert = require('assert');
const sinon = require('sinon');
const nock = require('nock');

const testUrl = 'https://facebook.com/wilsonpage';
const adaptorUrl = 'http://box.wilsonpage.me/magnet-facebook-adaptor';

const requestBody = {
  objects: [ { url: testUrl } ],
  adaptors: [
    {
      pattern: 'facebook\.com/.+',
      url: adaptorUrl
    }
  ]
};

/**
 * Tests
 */

describe('adaptors', () => {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sandbox.restore();
    nock.cleanAll();
  });

  it('requests the adaptor url instead', done => {
    let endUrl;
    const testUrlStub = nock(testUrl)
      .get(/./)
      .reply(200);

    const adaptorUrlStub = nock(adaptorUrl)
      .get(/./)
      .reply(200, function(uri) {
        endUrl = uri;
        return { title: 'adapted title' };
      });

    supertest(app)
      .post('/metadata/')
      .send(requestBody)
      .end((err, res) => {
        if (err) {
          throw err;
        }
        assert.equal(testUrlStub.isDone(), false, 'original url not called');
        assert.equal(adaptorUrlStub.isDone(), true, 'adaptor called');
        assert.equal(endUrl, `/magnet-facebook-adaptor?url=${encodeURIComponent('https://facebook.com/wilsonpage')}`);
        assert.equal(res.body[0].title, 'adapted title');
        done();
      });
  });

  it('does no html-parsing if the service returns JSON', function(done) {
    this.sandbox.spy(parseHtml, 'parse');

    nock(adaptorUrl)
      .get(/./)
      .reply(
        200,
        { title: 'adapted title' },
        { 'Content-Type': 'application/json; charset=utf-8' }
      );

    supertest(app)
      .post('/metadata/')
      .send(requestBody)
      .end((err, res) => {
        if (err) {
          throw err;
        }
        assert.equal(res.body[0].title, 'adapted title');
        sinon.assert.notCalled(parseHtml.parse);
        done();
      });
  });

  it('checks for matching adaptors after redirects', function(done) {
    const shortenedUrl = 'http://goo.gl/WNdChy';

    // redirect
    nock('http://goo.gl')
      .get('/WNdChy')
      .reply(301, 'CONTENT', {
        'Location': 'https://facebook.com/wilsonpage',
        'Content-Type': 'text/html; charset=utf-8'
      });

    // unwrapped url response
    nock('https://facebook.com/wilsonpage')
      .get(/./)
      .reply(200);

    // adaptor response
    const adaptorUrlStub = nock(adaptorUrl)
      .get(/./)
      .reply(200, '<title>wilson page</title>');

    supertest(app)
      .post('/metadata/')
      .send({
        objects: [{ url: shortenedUrl }],
        adaptors: requestBody.adaptors
      })

      .end((err, res) => {
        assert.equal(res.body[0].title, 'wilson page');
        assert.equal(adaptorUrlStub.isDone(), true, 'adaptor was used');
        done();
      });
  });
});
