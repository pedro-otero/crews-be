const express = require('express');
const Request = require('supertest');
const sinon = require('sinon');
const assert = require('assert');

const route = require('./spotify');

describe('Spotify middleware', () => {
  describe('Album is NOT in store', () => {
    beforeEach(function () {
      const app = express();
      app.use('/data/album', route);
      app.use('/data/album', (req, res) => {
        res.status(200).send('NEXT CALLED');
      });
      this.api = {
        getAlbum: sinon.stub().resolves({ body: { id: 1 } }),
      };
      this.actions = {
        addAlbum: sinon.stub(),
      };
      app.locals.spotify = {
        getApi: () => Promise.resolve(this.api),
      };
      app.locals.actions = this.actions;
      app.locals.store = {
        getState: () => ({
          albums: [],
        }),
      };
      this.request = Request(app);
    });

    it('calls next middleware after getting album', function (done) {
      this.request.get('/data/album/1').expect('NEXT CALLED', done);
    });

    it('gets the album with the id passed in the path', function (done) {
      this.request.get('/data/album/1').expect('NEXT CALLED', () => {
        assert.equal(this.api.getAlbum.getCalls()[0].args[0], 1);
        done();
      });
    });

    it('adds album to the store', function (done) {
      this.request.get('/data/album/1').expect('NEXT CALLED', () => {
        assert.equal(this.actions.addAlbum.getCalls()[0].args[0].id, 1);
        done();
      });
    });
  });

  describe('Album is in store', () => {
    beforeEach(function () {
      const app = express();
      app.use('/data/album', route);
      app.use('/data/album', (req, res) => {
        res.status(200).send('NEXT CALLED');
      });
      this.api = {
        getAlbum: sinon.stub().resolves({ body: { id: 1 } }),
      };
      this.actions = {
        addAlbum: sinon.stub(),
      };
      app.locals.spotify = {
        getApi: () => Promise.resolve(this.api),
      };
      app.locals.actions = this.actions;
      app.locals.store = {
        getState: () => ({
          albums: [{ id: '1' }],
        }),
      };
      this.request = Request(app);
    });

    it('calls next middleware after getting album', function (done) {
      this.request.get('/data/album/1').expect('NEXT CALLED', done);
    });

    it('does not get album again', function (done) {
      this.request.get('/data/album/1').expect('NEXT CALLED', () => {
        assert.equal(this.api.getAlbum.getCalls().length, 0);
        done();
      });
    });

    it('does not add album to the store', function (done) {
      this.request.get('/data/album/1').expect('NEXT CALLED', () => {
        assert.equal(this.actions.addAlbum.getCalls().length, 0);
        done();
      });
    });
  });
});
