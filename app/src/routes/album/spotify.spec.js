const express = require('express');
const Request = require('supertest');
const sinon = require('sinon');
const assert = require('assert');

const route = require('./spotify');

function setup() {
  const app = express();
  app.use('/data/album', route);
  app.use('/data/album', (req, res) => {
    res.status(200).send('NEXT CALLED');
  });
  this.state = {
    albums: [{ id: 'A2' }],
    addAlbum: sinon.stub(),
  };
  app.locals.state = this.state;
  const getAlbum = id => Promise.resolve({
    A1: { body: { id: 'A1' } },
  }[id]);
  this.api = {
    getAlbum: sinon.stub().callsFake(getAlbum),
  };
  app.locals.spotify = {
    getApi: () => Promise.resolve(this.api),
  };
  this.app = app;
}

describe('Spotify middleware', () => {
  describe('Album is NOT in store', () => {
    beforeEach(function (done) {
      setup.bind(this)();
      Request(this.app).get('/data/album/A1').expect('NEXT CALLED', done);
    });

    it('gets the album with the id passed in the path', function () {
      assert.equal(this.api.getAlbum.getCalls()[0].args[0], 'A1');
    });

    it('adds album to the store', function () {
      assert.equal(this.state.addAlbum.getCalls()[0].args[0].id, 'A1');
    });
  });

  describe('Album is in store', () => {
    beforeEach(function (done) {
      setup.bind(this)();
      Request(this.app).get('/data/album/A2').expect('NEXT CALLED', done);
    });

    it('does not get album again', function () {
      assert.equal(this.api.getAlbum.getCalls().length, 0);
    });

    it('does not add album to the store', function () {
      assert.equal(this.state.addAlbum.getCalls().length, 0);
    });
  });

  describe('Album promise rejects', () => {
    beforeEach(function (done) {
      setup.bind(this)();
      this.api = {
        getAlbum: sinon.stub().rejects(Error()),
      };
      Request(this.app).get('/data/album/AX').expect(404, done);
    });

    it('does not add nothing to the store', function () {
      assert.equal(this.state.addAlbum.getCalls().length, 0);
    });
  });

  describe('getApi promise rejects', () => {
    beforeEach(function (done) {
      setup.bind(this)();
      this.app.locals.spotify = {
        getApi: sinon.stub().rejects(Error()),
      };
      Request(this.app).get('/data/album/AX').expect(500, done);
    });

    it('does not add nothing to the store', function () {
      assert.equal(this.state.addAlbum.getCalls().length, 0);
    });
  });
});
