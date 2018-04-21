const sinon = require('sinon');
const assert = require('assert');
const Rx = require('rxjs');

const searchAlbum = require('./index');
const { actions } = require('../redux/state');

describe('Search function', () => {
  before(function () {
    this.db = {
      search: () => ({}),
      getRelease: () => ({}),
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
        this.spotify = {
          getApi: () => Promise.resolve({
            getAlbum: sinon.stub().resolves({
              body: {
                name: 'Album', artists: [{ name: 'Artist' }],
              },
            }),
          }),
        };
        this.search = searchAlbum(this.spotify, this.db, this.createLogger);
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
          const db = {
            search: () => new Promise(() => {
              throw Error();
            }),
          };
          this.search = searchAlbum(this.spotify, db, this.createLogger);
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

      describe('Discogs search emits an error', () => {
        beforeEach(function () {
          actions.removeReleases = sinon.spy();
          actions.removeResults = sinon.spy();
          const db = {
            search: () => new Promise((resolve, reject) => {
              reject('ERROR');
            }),
          };
          this.search = searchAlbum(this.spotify, db, this.createLogger);
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

        it('search results are removed', function (done) {
          const search = this.search(1);
          search.start()
            .then(() => {
              assert(actions.removeResults.calledOnce);
            })
            .then(done)
            .catch(() => assert(false));
        });

        it('search releases are removed', function (done) {
          const search = this.search(1);
          search.start()
            .then(() => {
              assert(actions.removeReleases.calledOnce);
            })
            .then(done)
            .catch(() => assert(false));
        });
      });
    });

    describe('Spotify album does not exist', () => {
      beforeEach(function () {
        actions.removeSearch = sinon.spy();
        const spotify = {
          getApi: () => Promise.resolve({
            getAlbum: () => Promise.reject({
              error: {
                status: 404,
              },
            }),
          }),
        };
        this.search = searchAlbum(spotify, this.db, this.createLogger);
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

      it('search is aborted', function (done) {
        const search = this.search(1);
        search.start()
          .then(() => assert(false), () => {
            assert(actions.removeSearch.calledOnce);
          })
          .then(done)
          .catch(() => assert(false));
      });
    });

    describe('Spotify id is invalid', () => {
      beforeEach(function () {
        actions.removeSearch = sinon.spy();
        const spotify = {
          getApi: () => Promise.resolve({
            getAlbum: () => Promise.reject({
              error: {
                status: 400,
              },
            }),
          }),
        };
        this.search = searchAlbum(spotify, this.db, this.createLogger);
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

      it('search is aborted', function (done) {
        const search = this.search(1);
        search.start()
          .then(() => assert(false), () => {
            assert(actions.removeSearch.calledOnce);
          })
          .then(done)
          .catch(() => assert(false));
      });
    });

    describe('Fails for some other reason', () => {
      beforeEach(function () {
        const spotify = {
          getApi: () => Promise.resolve({
            getAlbum: () => Promise.reject({
              error: {
                status: 500,
              },
            }),
          }),
        };
        this.search = searchAlbum(spotify, this.db, this.createLogger);
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
    const spotify = {
      getApi: () => Promise.reject({
        error: {
          status: 500,
        },
      }),
    };
    const func = searchAlbum(spotify, this.db, this.createLogger);
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
