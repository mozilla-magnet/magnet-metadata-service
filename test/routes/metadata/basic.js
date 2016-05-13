'use strict';

/**
 * Dependencies
 */

var parseHtml = require('magnet-html-parser');
var app = require('../../../lib/routes/api');
var supertest = require('supertest');
var assert = require('assert');
var sinon = require('sinon');
var nock = require('nock');

/**
 * Tests
 */

describe('basic parsing', () => {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sandbox.restore();
    nock.cleanAll();
  });

  it('should give us compatible output with Google PW service', function(done) {
    var requestBody = {
      objects: [{ url: 'https://mozilla.org/' }]
    };

    // mock response
    nock('https://mozilla.org')
      .get('/')
      .reply(200, '<title>mozilla</title><meta name="description" content="desc"/>');

    supertest(app)
      .post('/metadata/')
      .send(requestBody)
      .expect(200)
      .end((err, res) => {
        if (err) {
          throw err;
        }
        assert.equal(res.body.length, 1);
        var result = res.body[0];

        [
          'id',
          'url',
          'displayUrl',
          'title',
          'description'
        ].forEach(field => assert.ok(result[field]));

        assert.equal(result.id, result.url);
        assert.equal(result.id, result.displayUrl);
        done();
      });
  });

  it('should give information of several sites at once', (done) => {
    var requestBody = {
      objects: [
        { url: 'https://mozilla.org/' },
        { url: 'http://facebook.com/' }
      ]
    };

    // mock response
    nock('https://mozilla.org')
      .get('/')
      .reply(200, '<title>mozilla</title>');

    // mock response
    nock('http://facebook.com')
      .get('/')
      .reply(200, '<title>facebook</title>');

    supertest(app)
      .post('/metadata')
      .send(requestBody)
      .expect(200)
      .end((err, res) => {
        if (err) {
          throw err;
        }
        assert.equal(res.body.length, 2);
        assert.equal(res.body[0].title, 'mozilla');
        assert.equal(res.body[1].title, 'facebook');
        done();
      });
  });

  it('should unwrap shorted urls', function(done) {
    var endUrl = 'https://twitter.com/mepartoconmigo';
    var sites = {
      objects: [{ url: 'http://bit.ly/1Q3Pb6u' }]
    };

    // redirect
    nock('http://bit.ly')
      .get('/1Q3Pb6u')
      .reply(301, 'CONTENT', {
        'Location': 'https://twitter.com/mepartoconmigo',
        'Content-Type': 'text/html; charset=utf-8'
      });

    // final response
    nock('https://twitter.com')
      .get('/mepartoconmigo')
      .reply(200, '<title>Francisco</title>', {
        'Content-Type': 'text/html; charset=utf-8'
      });

    supertest(app)
      .post('/metadata')
      .send(sites)
      .expect(200)
      .end((err, res) => {
        if (err) {
          throw err;
        }
        assert.equal(res.body.length, 1);
        assert.equal(res.body[0].url, endUrl);
        done();
      });
  });

  it('does not 500 if one url errors', function(done) {
    this.sandbox.stub(parseHtml, 'parse');
    parseHtml.parse.returns(Promise.resolve({}));

    nock('https://twitter.com')
      .get('/mepartoconmigo')
      .reply(200, 'CONTENT', {
        'Content-Type': 'text/html; charset=utf-8'
      });

    nock('https://fakecalendar.com')
      .get('/')
      .reply(200, 'CONTENT', {
        'Content-Type': 'text/calendar; charset=utf-8'
      });

    var requestBody = {
      objects: [
        { url: 'https://twitter.com/mepartoconmigo' },
        { url: 'https://fakecalendar.com/' }
      ]
    };

    supertest(app)
      .post('/metadata/')
      .send(requestBody)
      .end((err, res) => {
        var error = res.body[1].error;
        assert.ok(error);
        assert.ok(error.indexOf('unsupported response type') > -1);
        done();
      });
  });

  it('does html-parsing if the service returns HTML', function(done) {
    this.sandbox.spy(parseHtml, 'parse');

    var requestBody = {
      objects: [{ url: 'https://facebook.com/wilsonpage' }]
    };

    nock('https://facebook.com/wilsonpage')
      .get(/./)
      .reply(200, '<title>wilson page</title>', {
        'Content-Type': 'text/html; charset=utf-8'
      });

    supertest(app)
      .post('/metadata/')
      .send(requestBody)
      .end((err, res) => {
        assert.equal(res.body[0].title, 'wilson page');
        sinon.assert.calledOnce(parseHtml.parse);
        done();
      });
  });
});
