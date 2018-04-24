const sinon = require('sinon');
const assert = require('assert');

const searchAlbum = require('./index');
const { actions } = require('../redux/state');

const createWebApiError = (message, statusCode) => Object.assign(Error(message), {
  name: 'WebapiError',
  statusCode,
});

describe('Search function', () => {
  describe('Spotify logs in', () => {
    describe('Spotify getAlbum exists', () => {
      beforeEach(function (done) {
        actions.addSearch = sinon.spy();
        actions.addAlbum = sinon.spy();
        const spotify = {
          getApi: () => Promise.resolve({
            getAlbum: sinon.stub().resolves({
              body: {
                name: 'Album', artists: [{ name: 'Artist' }],
              },
            }),
          }),
        };
        const createLogger = () => ({
          results: () => {},
          release: () => {},
          finish: () => {},
          error: () => {},
        });
        this.search = searchAlbum(spotify, null, createLogger);
        const search = this.search(1);
        search.start()
          .then((result) => { this.searchResult = result; })
          .then(done)
          .catch(() => done('FAILED'));
      });

      it('Returns a newly created search', function () {
        assert.equal(1, this.searchResult.id);
      });

      it('Adds search to state', () => {
        assert(actions.addSearch.calledOnce);
      });

      it('Adds album to state', () => {
        assert(actions.addAlbum.calledOnce);
      });

      describe('Discogs search throws an exception', () => {
        beforeEach(function (done) {
          const createLogger = () => {
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
          const db = {
            search: () => new Promise(() => {
              throw Error();
            }),
          };
          const spotify = {
            getApi: () => Promise.resolve({
              getAlbum: sinon.stub().resolves({
                body: {
                  name: 'Album', artists: [{ name: 'Artist' }],
                },
              }),
            }),
          };
          this.search = searchAlbum(spotify, db, createLogger);
          const search = this.search(1);
          search.start()
            .then(() => done())
            .catch(() => done(Error('FAILED')));
        });

        it('Error logger is called', function () {
          assert(this.errorLogger.calledOnce);
        });
      });

      describe('Discogs search emits an error', () => {
        before(function (done) {
          actions.clearSearch = sinon.spy();
          const db = {
            search: () => new Promise((resolve, reject) => {
              reject(Error('ERROR'));
            }),
          };
          const createLogger = () => {
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
          const spotify = {
            getApi: () => Promise.resolve({
              getAlbum: sinon.stub().resolves({
                body: {
                  name: 'Album', artists: [{ name: 'Artist' }],
                },
              }),
            }),
          };
          searchAlbum(spotify, db, createLogger)(1)
            .start()
            .then(() => done())
            .catch(() => done(Error('FAILED')));
        });

        it('Error logger is called', function () {
          assert(this.errorLogger.calledOnce);
        });

        it('search is cleared', () => {
          assert(actions.clearSearch.calledOnce);
        });
      });
    });

    describe('Spotify album does not exist', () => {
      beforeEach(function () {
        actions.removeSearch = sinon.spy();
        const spotify = {
          getApi: () => Promise.resolve({
            getAlbum: () => Promise.reject(createWebApiError(null, 404)),
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
            getAlbum: () => Promise.reject(createWebApiError(null, 400)),
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
            getAlbum: () => Promise.reject(createWebApiError(null, 500)),
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
      getApi: () => Promise.reject(createWebApiError(null, 500)),
    };
    const db = {
      search: () => ({}),
      getRelease: () => ({}),
    };
    const func = searchAlbum(spotify, db, this.createLogger);
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
