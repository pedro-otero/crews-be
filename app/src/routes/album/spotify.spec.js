const express = require('express');
const Request = require('supertest');

const route = require('./spotify');

describe('Spotify middleware', () => {
  describe('Nothing fails', () => {
    it('calls next middleware after getting album', function (done) {
      const app = express();
      app.use('/data/album', route);
      app.use('/data/album', (req, res) => {
        res.status(200).send('NEXT CALLED');
      });
      app.locals.spotify = {
        getApi: () => Promise.resolve({
          getAlbum: () => ({}),
        }),
      };
      this.request = Request(app);
      this.request.get('/data/album/1').expect('NEXT CALLED', done);
    });
  });
});
