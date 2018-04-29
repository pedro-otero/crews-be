const express = require('express');
const Request = require('supertest');

const route = require('./spotify');

describe('Spotify middleware', () => {
  it('calls next middleware after getting album', (done) => {
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
    const request = Request(app);
    request.get('/data/album/1').expect('NEXT CALLED', done);
  });
});
