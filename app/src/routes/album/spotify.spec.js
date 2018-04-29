const express = require('express');
const Request = require('supertest');
const sinon = require('sinon');
const assert = require('assert');

const route = require('./spotify');

describe('Spotify middleware', () => {
  describe('Nothing fails', () => {
    before(function () {
      const app = express();
      app.use('/data/album', route);
      app.use('/data/album', (req, res) => {
        res.status(200).send('NEXT CALLED');
      });
      this.api = {
        getAlbum: sinon.stub().resolves({}),
      };
      app.locals.spotify = {
        getApi: () => Promise.resolve(this.api),
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
  });
});
