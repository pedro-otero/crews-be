const express = require('express');
const Request = require('supertest');
const sinon = require('sinon');
const assert = require('assert');

const route = require('./search');

describe('Search middleware', () => {
  it('starts search if it does NOT exist', (done) => {
    const app = express();
    app.locals.searchAlbum = sinon.stub().returns({
      start: () => Promise.resolve({ status: 200 }),
    });
    app.locals.store = {
      getState: () => ({
        searches: [],
      }),
    };
    app.use('/data/album', route);
    app.use('/data/album', (req, res) => {
      res.status(200).send('NEXT CALLED');
    });
    const request = Request(app);
    request.get('/data/album/1').expect('NEXT CALLED', () => {
      assert(app.locals.searchAlbum.calledOnce);
      done();
    });
  });

  it('does not start search if it DOES exist', (done) => {
    const app = express();
    app.locals.searchAlbum = sinon.stub();
    app.locals.store = {
      getState: () => ({
        searches: [{ id: '1' }],
      }),
    };
    app.use('/data/album', route);
    app.use('/data/album', (req, res) => {
      res.status(200).send('NEXT CALLED');
    });
    const request = Request(app);
    request.get('/data/album/1').expect('NEXT CALLED', () => {
      assert(!app.locals.searchAlbum.calledOnce);
      done();
    });
  });
});
