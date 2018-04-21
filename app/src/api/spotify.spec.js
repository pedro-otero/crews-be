const assert = require('assert');
const sinon = require('sinon');

const Spotify = require('./spotify');

const ok = {
  statusCode: 200,
  body: {
    access_token: 'x',
    expires_in: 0,
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
      spotify.getApi().then(() => assert(false), () => {
        spotify.getApi().then(assert).then(done);
      });
    });

    it('logins again if token expired', (done) => {
      const spotify = Spotify(function () {
        this.setAccessToken = () => {};
        this.clientCredentialsGrant = sinon.stub()
          .onCall(0).resolves(ok)
          .onCall(1)
          .resolves(ok);
      });
      spotify.getApi().then(() => {
        spotify.getApi().then(assert).then(done);
      }, () => assert(false));
    });

    it('attaches new api requests to an active login promise', (done) => {
      const setTokenSpy = sinon.spy();
      const spotify = Spotify(function () {
        this.setAccessToken = setTokenSpy;
        this.clientCredentialsGrant = () => Promise.resolve(ok);
      });
      Promise.all([1, 2, 3, 4, 5].map(() => spotify.getApi()))
        .then(() => {
          assert(setTokenSpy.calledOnce);
          done();
        });
    });
  });
});
