'use strict';

/**
 * Dependencies
 */

const app = require('../lib/routes/api');
const request = require('supertest');

describe('api', () => {
  it('should discard invalid http verbs', (done) => {
    request(app)
      .get('/metadata/')
      .expect(404)
      .end(done);
  });

  it('should discard invalid requests format', (done) => {
    request(app)
      .post('/metadata')
      .send({ 'url': 'http://example.com' })
      .expect(400)
      .end(done);
  });

  // Writing this test realised that the integration with the google
  // service api is broken xD
  // it('should support Physical Web service api', (done) => {
  //   request(app)
  //     .post('/resolve-scan')
  //     .send(basicSites)
  //     .expect(200)
  //     .end(done);
  // });
});
