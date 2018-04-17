const sinon = require('sinon');
const assert = require('assert');
const Rx = require('rxjs');

const search = require('./index');

const discogs = {
  findReleases: () => Rx.Observable.create((observer) => {
    observer.next({});
    observer.next({});
    observer.complete();
  }),
};

const store = {
  getState: () => ({ searches: [] }),
};

const logger = {
  results: () => {},
  release: () => {},
  finish: () => {},
  error: () => {},
};
sinon.spy(logger, 'error');
const createLogger = () => (logger);

describe('Search function', () => {
  describe('Spotify logs in', () => {
    describe('Spotify getAlbum exists', () => {
      beforeEach(function () {
        this.spotify = Promise.resolve({
          getAlbum: sinon.stub().resolves({
            name: 'Album', artists: [{ name: 'Artist' }],
          }),
        });
        this.search = search(this.spotify, discogs, store, createLogger);
      });

      it('Returns a newly created search', function (done) {
        this.search(1)
          .then(result => assert.equal(1, result.id))
          .then(done)
          .catch(() => assert(false));
      });

      describe('Discog api throws an exception', function () {
        beforeEach(function () {
          const discogs = {
            findReleases: () => Rx.Observable.create(() => {
              throw Error();
            }),
          };
          this.search = search(this.spotify, discogs, store, createLogger);
        });

        it('promise rejects with error', function (done) {
          this.search(1)
            .then(() => {
              assert(logger.error.calledOnce);
            })
            .then(done)
            .catch(() => assert(false));
        });
      });
    });

    describe('Spotify album does not exist', () => {
      beforeEach(function () {
        const spotify = Promise.resolve({
          getAlbum: () => Promise.reject({
            error: {
              status: 404,
            },
          }),
        });
        this.search = search(spotify, discogs, store, createLogger);
      });

      it('Returns error with message', function (done) {
        this.search(1)
          .then(() => {
            assert(false);
          }, (err) => {
            assert.equal(err.message, 'Album does not exist in Spotify');
          })
          .then(done)
          .catch(() => {
            assert(false);
            done();
          });
      });
    });

    describe('Spotify id is invalid', () => {
      beforeEach(function () {
        const spotify = Promise.resolve({
          getAlbum: () => Promise.reject({
            error: {
              status: 400,
            },
          }),
        });
        this.search = search(spotify, discogs, store, createLogger);
      });

      it('Returns error with message', function (done) {
        this.search(1)
          .then(() => {
            assert(false);
          }, (err) => {
            assert.equal(err.message, 'Spotify album id is invalid');
          })
          .then(done)
          .catch(() => {
            assert(false);
            done();
          });
      });
    });

    describe('Fails for some other reason', () => {
      beforeEach(function () {
        const spotify = Promise.resolve({
          getAlbum: () => Promise.reject({
            error: {
              status: 500,
            },
          }),
        });
        this.search = search(spotify, discogs, store, createLogger);
      });

      it('Returns error with message', function (done) {
        this.search(1)
          .then(() => {
            assert(false);
          }, (err) => {
            assert.equal(err.message, "There's something wrong with Spotify");
          })
          .then(done)
          .catch(() => {
            assert(false);
            done();
          });
      });
    });
  });

  it('Spotify login fails', (done) => {
    const spotify = Promise.reject({
      error: {
        status: 500,
      },
    });
    const func = search(spotify, discogs, store, createLogger);
    func(1)
      .then(() => {
        assert(false);
      }, (err) => {
        assert.equal(err.message, "Server couldn't login to Spotify");
      })
      .then(done)
      .catch(() => {
        assert(false);
        done();
      });
  });
});
