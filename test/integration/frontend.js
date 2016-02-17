'use strict';

const request = require('supertest');
const app = require('../../app');

describe('Frontend', () => {
  it('should redirect to github repo', (done) => {
    request(app)
      .get('/')
      .expect(302)
      .expect('Location', 'https://github.com/arcturus/pw-ws')
      .end(done);
  });
});
