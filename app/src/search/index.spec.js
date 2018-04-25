const sinon = require('sinon');
const assert = require('assert');

const searchAlbum = require('./index');
const { actions } = require('../redux/state');

const createWebApiError = (message, statusCode) => Object.assign(Error(message), {
  name: 'WebapiError',
  statusCode,
});

function monkeypatchActions() {
  actions.addSearch = sinon.stub();
  actions.addAlbum = sinon.stub();
  actions.setLastRelease = sinon.stub();
  actions.setLastSearchPage = sinon.stub();
  actions.addCredits = sinon.stub();
  actions.clearSearch = sinon.spy();
  actions.removeSearch = sinon.spy();
}

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

function setup(context) {
  monkeypatchActions();
  context.db = {
    search: sinon.stub()
      .onCall(0).resolves(pages[0])
      .onCall(1)
      .resolves(pages[1]),
    getRelease: sinon.stub().callsFake(id => Promise.resolve(blankRelease(id))),
  };
  context.spotifyApi = {
    getAlbum: sinon.stub().resolves({
      body: {
        id: 'A1',
        name: 'Album',
        artists: [{ name: 'Artist' }],
        tracks: { items: [] },
      },
    }),
  };
  context.spotify = {
    getApi: sinon.stub().resolves(context.spotifyApi),
  };
  context.logger = {
    results: sinon.stub(),
    release: sinon.stub(),
    finish: sinon.stub(),
    error: sinon.stub(),
  };
}

function resetActionStubs() {
  [
    'addSearch',
    'addAlbum',
    'setLastRelease',
    'setLastSearchPage',
    'addCredits',
    'clearSearch',
    'removeSearch',
  ].forEach(action => actions[action].resetHistory());
}

describe('Search function', () => {
  context('Nothing fails', () => {
    beforeEach(function (done) {
      setup(this);
      this.logger.finish = sinon.stub().callsFake(() => done());
      searchAlbum(this.spotify, this.db, () => this.logger)('A1')
        .start()
        .then((result) => { this.searchResult = result; })
        .catch(done);
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

    afterEach(resetActionStubs);
  });

  describe('Discogs search throws an exception', () => {
    beforeEach(function (done) {
      setup(this);
      this.db.search = sinon.stub().throws();
      this.logger.error = sinon.stub().callsFake(() => done());
      actions.finish = sinon.stub().callsFake(() => done());
      searchAlbum(this.spotify, this.db, () => this.logger)('A1')
        .start()
        .then((result) => { this.searchResult = result; })
        .catch(done);
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    afterEach(resetActionStubs);
  });

  describe('Discogs results processing throws an exception', () => {
    beforeEach(function (done) {
      setup(this);
      this.db.search = sinon.stub().resolves({});
      this.logger.error = sinon.stub().callsFake(() => done());
      actions.finish = sinon.stub().callsFake(() => done());
      searchAlbum(this.spotify, this.db, () => this.logger)('A1')
        .start()
        .then((result) => { this.searchResult = result; })
        .catch(done);
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    afterEach(resetActionStubs);
  });

  describe('Discogs search promise rejects', () => {
    beforeEach(function (done) {
      setup(this);
      this.db.search = sinon.stub().rejects(Error('ERROR'));
      actions.clearSearch = sinon.stub().callsFake(() => done());
      searchAlbum(this.spotify, this.db, () => this.logger)('A1')
        .start()
        .then((result) => { this.searchResult = result; })
        .catch(done);
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    it('search is cleared', () => {
      assert(actions.clearSearch.calledOnce);
    });

    afterEach(resetActionStubs);
  });

  describe('Discogs search promise rejects because of timeout', () => {
    beforeEach(function (done) {
      setup(this);
      this.db = {
        search: sinon.stub()
          .onCall(0).rejects({
            code: 'ETIMEDOUT',
            errno: 'ETIMEDOUT',
          })
          .onCall(1)
          .resolves(pages[0])
          .onCall(2)
          .resolves(pages[1]),
        getRelease: sinon.stub().callsFake(id => Promise.resolve(blankRelease(id))),
      };
      this.logger.finish = sinon.stub().callsFake(() => done());
      searchAlbum(this.spotify, this.db, () => this.logger)('A1')
        .start()
        .then((result) => { this.searchResult = result; })
        .catch(done);
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    it('search is called 3 times', function () {
      assert.equal(this.db.search.getCalls().length, 3);
    });

    it('search is NOT cleared', () => {
      assert.equal(actions.clearSearch.getCalls().length, 0);
    });

    afterEach(resetActionStubs);
  });

  describe('Discogs release retrieval rejects because of timeout', () => {
    beforeEach(function (done) {
      setup(this);
      const releaseStub = sinon.stub().onCall(0).rejects({
        code: 'ETIMEDOUT',
        errno: 'ETIMEDOUT',
      });
      [1, 2, 3, 4].forEach(id => releaseStub.onCall(id).resolves(blankRelease(id)));
      this.db = {
        search: sinon.stub()
          .onCall(0).resolves(pages[0])
          .onCall(1)
          .resolves(pages[1]),
        getRelease: releaseStub,
      };
      this.logger.finish = sinon.stub().callsFake(() => done());
      searchAlbum(this.spotify, this.db, () => this.logger)('A1')
        .start()
        .then((result) => { this.searchResult = result; })
        .catch(done);
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    it('getRelease is called 5 times', function () {
      assert.equal(this.db.getRelease.getCalls().length, 5);
    });

    it('search is NOT cleared', () => {
      assert.equal(actions.clearSearch.getCalls().length, 0);
    });

    afterEach(resetActionStubs);
  });

  describe('Spotify album does not exist', () => {
    beforeEach(function (done) {
      setup(this);
      this.spotify = {
        getApi: sinon.stub().resolves({
          getAlbum: sinon.stub().rejects(createWebApiError(null, 404)),
        }),
      };
      actions.removeSearch = sinon.stub().callsFake(() => done());
      this.search = searchAlbum(this.spotify, this.db, () => this.logger)('A1').start();
    });

    it('Returns error with message', function (done) {
      this.search.then(done, (error) => {
        assert.equal(error.message, 'Album does not exist in Spotify');
        done();
      });
    });

    it('search is aborted', () => {
      assert(actions.removeSearch.calledOnce);
    });
  });

  describe('Spotify id is invalid', () => {
    beforeEach(function (done) {
      setup(this);
      this.spotify = {
        getApi: sinon.stub().resolves({
          getAlbum: sinon.stub().rejects(createWebApiError(null, 400)),
        }),
      };
      actions.removeSearch = sinon.stub().callsFake(() => done());
      this.search = searchAlbum(this.spotify, this.db, () => this.logger)('A1').start();
    });

    it('Returns error with message', function (done) {
      this.search.then(done, (error) => {
        assert.equal(error.message, 'Spotify album id is invalid');
        done();
      });
    });

    it('search is aborted', () => {
      assert(actions.removeSearch.calledOnce);
    });
  });

  describe('Fails for some other reason', () => {
    beforeEach(function (done) {
      setup(this);
      this.spotify = {
        getApi: sinon.stub().resolves({
          getAlbum: sinon.stub().rejects(createWebApiError(null, 500)),
        }),
      };
      actions.removeSearch = sinon.stub().callsFake(() => done());
      this.search = searchAlbum(this.spotify, this.db, () => this.logger)('A1').start();
    });

    it('Returns error with message', function (done) {
      this.search.then(done, (error) => {
        assert.equal(error.message, "There's something wrong with Spotify");
        done();
      });
    });
  });

  describe.skip('Spotify login fails', () => {
    beforeEach(function (done) {
      setup.bind(this)(() => {
        this.spotify.getAlbum = sinon.stub().rejects(createWebApiError(null, 500));
      }, done);
    });

    it('tests are missing');
  });
});
