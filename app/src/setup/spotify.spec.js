const assert = require('assert');

const Spotify = require('./spotify');

describe('Spotify module', () => {
  describe('#getAPi', () => {
    it('resolves with logged in api', (done) => {
      const spotify = Spotify(function () {
        this.setAccessToken = () => {};
        this.clientCredentialsGrant = () => Promise.resolve({
          statusCode: 200,
          body: {
            access_token: 'x',
          },
        });
      });
      spotify.getApi().then(assert).then(done);
    });
  });
});
