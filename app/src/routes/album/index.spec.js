const express = require('express');
const Request = require('supertest');

const route = require('./index');

describe('Albums endpoint', () => {
  it('returns 200', (done) => {
    const app = express();
    app.locals.searchAlbum = () => ({
      start: () => Promise.resolve({ status: 200 }),
    });
    app.use('/data/album', route);
    const request = Request(app);
    request.get('/data/album/1').expect(200, done);
  });

  it('returns 404', (done) => {
    const app = express();
    app.locals.searchAlbum = () => ({
      start: () => Promise.reject({ status: 404 }),
    });
    app.use('/data/album', route);
    const request = Request(app);
    request.get('/data/album/1').expect(404, done);
  });

  it('returns 500', (done) => {
    const app = express();
    app.locals.searchAlbum = () => ({
      start: () => {
        throw Error();
      },
    });
    app.use('/data/album', route);
    const request = Request(app);
    request.get('/data/album/1').expect(500, done);
  });
});
