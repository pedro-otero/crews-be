const express = require('express');
const Request = require('supertest');
const sinon = require('sinon');

const route = require('./query');

describe('Existing search middleware', () => {
  it('returns 200 with query', (done) => {
    const app = express();
    app.use('/data/album', route);
    app.locals.state = {
      searches: [],
      albums: [{ id: '1' }],
      getProgress: sinon.stub(),
    };
    const request = Request(app);
    request.get('/data/album/1').expect(200, done);
  });

  it('returns 500 if query throws exception', (done) => {
    const app = express();
    app.use('/data/album', route);
    const request = Request(app);
    request.get('/data/album/2').expect(500, done);
  });
});
