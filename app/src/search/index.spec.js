const sinon = require('sinon');
const assert = require('assert');

const searchAlbum = require('./index');
const { actions } = require('../redux/state');

const createWebApiError = (message, statusCode) => Object.assign(Error(message), {
  name: 'WebapiError',
  statusCode,
});

describe('Search function', () => {
  context('Nothing fails', () => {
    beforeEach(function (done) {
      this.db = {
        search: sinon.stub()
          .onCall(0).resolves({ page: 1, pages: 2, results: [{ id: 1 }, { id: 2 }] })
          .onCall(1)
          .resolves({ page: 2, pages: 2, results: [{ id: 3 }, { id: 4 }] }),
        getRelease: sinon.stub().callsFake(id => Promise.resolve({ id })),
      };
      this.spotifyApi = {
        getAlbum: sinon.stub().resolves({
          body: {
            id: 'A1', name: 'Album', artists: [{ name: 'Artist' }],
          },
        }),
      };
      this.spotify = {
        getApi: sinon.stub().resolves(this.spotifyApi),
      };
      this.logger = {
        results: () => sinon.stub(),
        release: () => sinon.stub(),
        finish: () => sinon.stub(),
        error: () => sinon.stub(),
      };
      searchAlbum(this.spotify, this.db, () => this.logger)('A1')
        .start()
        .then((result) => { this.searchResult = result; })
        .then(done)
        .catch(() => done('FAILED!'));
    });

    it('Calls spotify module\'s getApi', function () {
      assert(this.spotify.getApi.calledOnce);
    });

    it('Calls spotify module\'s getAlbum only once', function () {
      assert(this.spotifyApi.getAlbum.calledOnce);
    });

    it('Calls spotify module\'s getAlbum for album A1', function () {
      assert.equal(this.spotifyApi.getAlbum.getCalls()[0].args[0], 'A1');
    });
  });

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
        searchAlbum(spotify, null, createLogger)(1)
          .start()
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
          searchAlbum(spotify, db, createLogger)(1)
            .start()
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
      beforeEach(function (done) {
        actions.removeSearch = sinon.spy();
        const spotify = {
          getApi: () => Promise.resolve({
            getAlbum: () => Promise.reject(createWebApiError(null, 404)),
          }),
        };
        searchAlbum(spotify, null, this.createLogger)(1)
          .start()
          .then(() => done(Error('FAILED')), (err) => {
            this.errorMessage = err.message;
            done();
          }).catch(() => done(Error('FAILED')));
      });

      it('Returns error with message', function () {
        assert.equal(this.errorMessage, 'Album does not exist in Spotify');
      });

      it('search is aborted', () => {
        assert(actions.removeSearch.calledOnce);
      });
    });

    describe('Spotify id is invalid', () => {
      beforeEach(function (done) {
        actions.removeSearch = sinon.spy();
        const spotify = {
          getApi: () => Promise.resolve({
            getAlbum: () => Promise.reject(createWebApiError(null, 400)),
          }),
        };
        this.search = searchAlbum(spotify, null, this.createLogger);
        const search = this.search(1);
        search.start()
          .then(() => done(Error('FAILED!')), () => {
            this.errorMessage = 'Spotify album id is invalid';
            done();
          })
          .catch(() => done(Error('FAILED!')));
      });

      it('Returns error with message', function () {
        assert.equal(this.errorMessage, 'Spotify album id is invalid');
      });

      it('search is aborted', () => {
        assert(actions.removeSearch.calledOnce);
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
