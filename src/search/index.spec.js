const sinon = require('sinon');
const assert = require('assert');
const Rx = require('rxjs');

const searchAlbum = require('./index');

describe('Search function', () => {
  before(function () {
    this.discogs = {
      findReleases: () => Rx.Observable.create((observer) => {
        observer.next({});
        observer.next({});
        observer.complete();
      }),
    };
    this.store = {
      getState: () => ({ searches: [] }),
    };
    this.createLogger = () => {
      const logger = {
        results: () => {},
        release: () => {},
        finish: () => {},
        error: () => {},
      };
      sinon.spy(logger, 'error');
      this.errorLogger = logger.error;
      return logger;
    };
  });

  describe('Spotify logs in', () => {
    describe('Spotify getAlbum exists', () => {
      beforeEach(function () {
        this.spotify = Promise.resolve({
          getAlbum: sinon.stub().resolves({
            name: 'Album', artists: [{ name: 'Artist' }],
          }),
        });
        this.search = searchAlbum(this.spotify, this.discogs, this.store, this.createLogger);
      });

      it('Returns a newly created search', function (done) {
        const search = this.search(1);
        search.start()
          .then(result => assert.equal(1, result.id))
          .then(done)
          .catch(() => assert(false));
      });

      describe('Discogs search throws an exception', () => {
        beforeEach(function () {
          const discogs = {
            findReleases: () => Rx.Observable.create(() => {
              throw Error();
            }),
          };
          this.search = searchAlbum(this.spotify, discogs, this.store, this.createLogger);
        });

        it('promise rejects with error', function (done) {
          const search = this.search(1);
          search.start()
            .then(() => {
              assert(this.errorLogger.calledOnce);
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
        this.search = searchAlbum(spotify, this.discogs, this.store, this.createLogger);
      });

      it('Returns error with message', function (done) {
        const search = this.search(1);
        search.start()
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
        this.search = searchAlbum(spotify, this.discogs, this.store, this.createLogger);
      });

      it('Returns error with message', function (done) {
        const search = this.search(1);
        search.start()
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
        this.search = searchAlbum(spotify, this.discogs, this.store, this.createLogger);
      });

      it('Returns error with message', function (done) {
        const search = this.search(1);
        search.start()
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

  it('Spotify login fails', function (done) {
    const spotify = Promise.reject({
      error: {
        status: 500,
      },
    });
    const func = searchAlbum(spotify, this.discogs, this.store, this.createLogger);
    const search = func(1);
    search.start()
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
