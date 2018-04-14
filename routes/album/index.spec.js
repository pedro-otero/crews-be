const express = require('express');
const request = require('supertest');

const route = require('./index');

describe('Albums endpoint', () => {
  beforeEach(function () {
    const app = express();
    app.locals.searchAlbum = () => Promise.resolve({ status: 200 });
    app.use('/data/album', route);
    this.request = request(app);
  });

  it('returns 200', function (done) {
    this.request
      .get('/data/album/1')
      .expect(200, done);
  });
});
