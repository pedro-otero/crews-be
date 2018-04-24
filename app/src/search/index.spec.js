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
      const blankRelease = id => ({ id, tracklist: [] });
      const pages = [{
        pagination: {
          page: 1,
          pages: 2,
        },
        results: [{ id: 1 }, { id: 2 }],
      }, {
        pagination: {
          page: 2,
          pages: 2,
        },
        results: [{ id: 3 }, { id: 4 }],
      }];
      this.db = {
        search: sinon.stub()
          .onCall(0).resolves(pages[0])
          .onCall(1)
          .resolves(pages[1]),
        getRelease: sinon.stub().callsFake(id => Promise.resolve(blankRelease(id))),
      };
      this.spotifyApi = {
        getAlbum: sinon.stub().resolves({
          body: {
            id: 'A1',
            name: 'Album',
            artists: [{ name: 'Artist' }],
            tracks: { items: [] },
          },
        }),
      };
      this.spotify = {
        getApi: sinon.stub().resolves(this.spotifyApi),
      };
      this.logger = {
        results: sinon.stub(),
        release: sinon.stub(),
        finish: sinon.stub().callsFake(() => done()),
        error: sinon.stub(),
      };
      actions.addSearch = sinon.stub();
      actions.addAlbum = sinon.stub();
      actions.setLastRelease = sinon.stub();
      actions.setLastSearchPage = sinon.stub();
      actions.addCredits = sinon.stub();
      searchAlbum(this.spotify, this.db, () => this.logger)('A1')
        .start()
        .then((result) => { this.searchResult = result; })
        .catch(() => done('FAILED!'));
    });

    it('Calls spotify module\'s getApi', function () {
      assert(this.spotify.getApi.calledOnce);
    });

    describe('Adds search to state', () => {
      it('only once', () => {
        assert(actions.addSearch.calledOnce);
      });

      it('with id A1', () => {
        assert.equal(actions.addSearch.getCalls()[0].args[0], 'A1');
      });
    });

    describe('Gets album', () => {
      it('only once', function () {
        assert(this.spotifyApi.getAlbum.calledOnce);
      });

      it('with id A1', function () {
        assert.equal(this.spotifyApi.getAlbum.getCalls()[0].args[0], 'A1');
      });

      it('adds it to state', () => {
        assert.equal(actions.addAlbum.getCalls()[0].args[0].id, 'A1');
      });
    });

    describe('Calls database methods', () => {
      it('search 2 times', function () {
        assert(this.db.search.calledTwice);
      });

      it('search for page 1', function () {
        assert.equal(this.db.search.getCalls()[0].args[0].page, 1);
      });

      it('search for page 2', function () {
        assert.equal(this.db.search.getCalls()[1].args[0].page, 2);
      });

      it('gets release 1', function () {
        assert.equal(this.db.getRelease.getCalls()[0].args[0], 1);
      });

      it('gets release 2', function () {
        assert.equal(this.db.getRelease.getCalls()[1].args[0], 2);
      });

      it('gets release 3', function () {
        assert.equal(this.db.getRelease.getCalls()[2].args[0], 3);
      });

      it('gets release 4', function () {
        assert.equal(this.db.getRelease.getCalls()[3].args[0], 4);
      });
    });

    it('logs the 4 releases', function () {
      assert.equal(this.logger.results.callCount, 2);
    });

    it('sets the 4 releases as last release', () => {
      assert.equal(actions.setLastRelease.callCount, 4);
    });

    it('gets credits for the 4 releases', () => {
      assert.equal(actions.addCredits.callCount, 4);
    });

    it('logs the 2 search pages', function () {
      assert.equal(this.logger.results.callCount, 2);
    });

    it('sets the 4 releases as last release', () => {
      assert.equal(actions.setLastSearchPage.callCount, 2);
    });

    describe('Returns a newly created search', () => {
      it('with correct id', function () {
        assert.equal('A1', this.searchResult.id);
      });

      it('with progress 0', function () {
        assert.equal(0, this.searchResult.progress);
      });

      it('with null bestMatch', function () {
        assert.equal(null, this.searchResult.bestMatch);
      });
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
