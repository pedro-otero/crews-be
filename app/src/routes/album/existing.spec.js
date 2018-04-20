const express = require('express');
const Request = require('supertest');

const route = require('./existing');

describe('Existing search middleware', () => {
  it('returns 200 with query', (done) => {
    const app = express();
    app.use('/data/album', route);
    app.locals.getQuery = () => ({});
    const request = Request(app);
    request.get('/data/album/1').expect(200, done);
  });

  it('returns 500 if query throws exception', (done) => {
    const app = express();
    app.use('/data/album', route);
    app.locals.getQuery = (() => {
      throw Error('ERROR');
    });
    const request = Request(app);
    request.get('/data/album/2').expect(500, done);
  });

  it('invokes next middleware if query is not found', (done) => {
    const app = express();
    app.use('/data/album', route);
    app.use('/data/album', (req, res) => {
      res.status(200).send('NEXT CALLED');
    });
    app.locals.getQuery = (() => null);
    const request = Request(app);
    request.get('/data/album/2').expect('NEXT CALLED', done);
  });
});
