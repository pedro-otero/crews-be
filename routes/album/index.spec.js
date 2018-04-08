const fs = require('fs');
const path = require('path');
const assert = require('assert');
const winston = require('winston');

const tests = fs.readdirSync('./routes/album/tests/').map(dir => ({
  album: require(path.join(__dirname, 'tests', dir, 'album.json')),
  release: require(path.join(__dirname, 'tests', dir, 'release.json')),
  expected: require(path.join(__dirname, 'tests', dir, 'expected.json')),
}));

const app = require('../../app');
const http = require('http');
const superagent = require('superagent');

const { printf, combine } = winston.format;
const logger = winston.createLogger({
  level: 'info',
  format: combine(printf(info => `${info.message}`)),
  transports: [
    new winston.transports.Console(),
  ],
});

describe('Albums endpoint', () => {
  let server;
  const port = process.env.PORT || 3000;

  before((done) => {
    app.locals.spotify = Promise.resolve({
      getAlbum: id => Promise.resolve(tests
        .reduce((albums, t) => (
          Object.assign({}, albums, { [t.album.id]: { body: t.album } }), {})[id])),
    });
    app.locals.discogs = {
      findReleases: album => Promise.resolve(tests
        .reduce((releases, t) => (
          Object.assign({}, releases, { [t.album.id]: [t.release] })), {})[album.id]),
    };
    server = http.createServer(app);
    server.listen(port, () => {
      logger.info(`Express server in test listening on port ${port}`);
      done();
    });
  });

  tests.forEach((t) => {
    const { album } = t;
    const { expected } = t;

    it(`"${album.artists[0].name} - ${album.name}"`, (done) => {
      superagent
        .get(`http://localhost:${port}/data/album/${album.id}`)
        .end((res) => {
          assert.equal(200, res.status);
          const actual = res.body;
          assert.equal(expected.title, actual.title);
          assert.equal(expected.artist, actual.artist);
          assert.equal(expected.duration, actual.duration);
          assert.equal(expected.spotify.album_id, actual.spotify.album_id);
          actual.tracks
            .map((track, i) => ({ actual: track, expected: expected.tracks[i] }))
            .forEach((set) => {
              assert.equal(set.expected.title, set.actual.title);
              assert.equal(set.expected.duration, set.actual.duration);
              set.actual.producers
                .forEach(producer => assert(set.expected.producers.includes(producer)));
              set.actual.composers
                .forEach(composer => assert(set.expected.composers.includes(composer)));
              set.actual.featured
                .forEach(feat => assert(set.expected.featured.includes(feat)));
              Object.keys(set.actual.credits).forEach((name) => {
                assert(Object.keys(set.expected.credits).includes(name));
                set.actual.credits[name]
                  .forEach(credit => assert(set.expected.credits[name].includes(credit)));
              });
            });
          done();
        });
    });
  });

  after(() => {
    server.close();
    logger.info('Express server in test has been shut down');
  });
});
