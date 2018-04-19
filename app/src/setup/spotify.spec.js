const assert = require('assert');
const sinon = require('sinon');

const Spotify = require('./spotify');

const ok = {
  statusCode: 200,
  body: {
    access_token: 'x',
  },
};

describe('Spotify module', () => {
  describe('#getAPi', () => {
    it('resolves with logged in api', (done) => {
      const spotify = Spotify(function () {
        this.setAccessToken = () => {};
        this.clientCredentialsGrant = () => Promise.resolve(ok);
      });
      spotify.getApi().then(assert).then(done);
    });

    it('rejects with error', (done) => {
      const spotify = Spotify(function () {
        this.clientCredentialsGrant = () => Promise.resolve({
          statusCode: 400,
        });
      });
      spotify.getApi().then(() => assert(false), assert).then(done);
    });

    it('rejects with error', (done) => {
      const spotify = Spotify(function () {
        this.clientCredentialsGrant = () => Promise.reject({});
      });
      spotify.getApi().then(() => assert(false), assert).then(done);
    });

    it('rejects with error', (done) => {
      const spotify = Spotify(function () {
        this.clientCredentialsGrant = () => new Promise((() => {
          throw Error();
        }));
      });
      spotify.getApi().then(() => assert(false), () => {
        assert(true);
      }).then(done);
    });

    it('can retry to login', (done) => {
      const spotify = Spotify(function () {
        this.setAccessToken = () => {};
        this.clientCredentialsGrant = sinon.stub()
          .onCall(0).rejects({ error: 'ERROR' })
          .onCall(1)
          .resolves(ok);
      });
      spotify.getApi().then(() => assert(false), (e) => {
        spotify.getApi().then(assert).then(done);
      });
    });
  });
});
