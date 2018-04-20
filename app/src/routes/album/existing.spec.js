const express = require('express');
const Request = require('supertest');

const route = require('./existing');

describe('Existing search middleware', () => {
  it('returns 200 with query', (done) => {
    const app = express();
    const getQuery = () => ({});
    app.use('/data/album', route(getQuery));
    const request = Request(app);
    request.get('/data/album/1').expect(200, done);
  });
});
