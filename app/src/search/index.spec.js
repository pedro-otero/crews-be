const sinon = require('sinon');
const assert = require('assert');

const searchAlbum = require('./index');
const { actions } = require('../redux/state');

function monkeypatchActions() {
  actions.addSearch = sinon.stub();
  actions.addAlbum = sinon.stub();
  actions.setLastRelease = sinon.stub();
  actions.setLastSearchPage = sinon.stub();
  actions.addCredits = sinon.stub();
  actions.clearSearch = sinon.spy();
  actions.removeSearch = sinon.spy();
}

const blankRelease = id => ({ id, tracklist: [{ title: 'Track #1' }] });

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
  results: [{ id: 3 }, { id: 4 }, { id: 5 }],
}];

function setup(times, done) {
  monkeypatchActions();
  const context = {};
  context.discogs = {
    db: {
      search: sinon.stub()
        .onCall(0).resolves(pages[0])
        .onCall(1)
        .resolves(pages[1]),
      getRelease: sinon.stub().callsFake((id) => {
        const release = blankRelease(id);
        if (id > 4) {
          release.tracklist.push({ title: 'Track #2' });
        }
        return Promise.resolve(release);
      }),
    },
  };
  context.timesInfoLogged = 0;
  context.logger = {
    error: sinon.stub(),
    info: sinon.stub().callsFake(() => {
      context.timesInfoLogged += 1;
      if (context.timesInfoLogged === times) {
        done();
      }
    }),
    debug: sinon.stub(),
  };
  return context;
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

const album = {
  id: 'A1',
  name: 'Album',
  artists: [{ name: 'Artist' }],
  tracks: {
    items: [{
      id: 'T1', name: 'Track #1',
    }],
  },
};

describe('Search function', () => {
  context('Nothing fails', () => {
    beforeEach(function (done) {
      Object.assign(this, setup(8, done));
      searchAlbum(this.discogs, () => this.logger)(album).start();
    });

    describe('Calls database methods', () => {
      it('search 2 times', function () {
        assert(this.discogs.db.search.calledTwice);
      });

      it('search for page 1', function () {
        assert.equal(this.discogs.db.search.getCalls()[0].args[0].page, 1);
      });

      it('search for page 2', function () {
        assert.equal(this.discogs.db.search.getCalls()[1].args[0].page, 2);
      });

      it('gets release 1', function () {
        assert.equal(this.discogs.db.getRelease.getCalls()[0].args[0], 1);
      });

      it('gets release 2', function () {
        assert.equal(this.discogs.db.getRelease.getCalls()[1].args[0], 2);
      });

      it('gets release 3', function () {
        assert.equal(this.discogs.db.getRelease.getCalls()[2].args[0], 3);
      });

      it('gets release 4', function () {
        assert.equal(this.discogs.db.getRelease.getCalls()[3].args[0], 4);
      });
    });

    it('sets all 5 releases as last release', () => {
      assert.equal(actions.setLastRelease.callCount, 5);
    });

    it('gets credits for only the 4 releases that have the same amount of tracks', () => {
      assert.equal(actions.addCredits.callCount, 4);
    });


    describe('logs', () => {
      it('8 times', function () {
        assert.equal(this.logger.info.callCount, 8);
      });

      describe('releases', () => {
        it('1', function () {
          assert(this.logger.info.getCalls()[1].args[0].endsWith('Artist - Album (A1) :: P(1/2) I(1/2) R-1 (M-undefined) OK'));
        });

        it('2', function () {
          assert(this.logger.info.getCalls()[2].args[0].endsWith('Artist - Album (A1) :: P(1/2) I(2/2) R-2 (M-undefined) OK'));
        });

        it('3', function () {
          assert(this.logger.info.getCalls()[4].args[0].endsWith('Artist - Album (A1) :: P(2/2) I(1/3) R-3 (M-undefined) OK'));
        });

        it('4', function () {
          assert(this.logger.info.getCalls()[5].args[0].endsWith('Artist - Album (A1) :: P(2/2) I(2/3) R-4 (M-undefined) OK'));
        });
      });

      describe('search pages', () => {
        it('1', function () {
          assert(this.logger.info.getCalls()[0].args[0].endsWith('Artist - Album (A1) :: P 1/2: 2 items'));
        });

        it('2', function () {
          assert(this.logger.info.getCalls()[3].args[0].endsWith('Artist - Album (A1) :: P 2/2: 3 items'));
        });
      });
    });

    it('sets the 4 releases as last release', () => {
      assert.equal(actions.setLastSearchPage.callCount, 2);
    });

    it('Logs info about release that is surely no match', function () {
      assert(this.logger.debug.getCalls()[0].args[0].endsWith('Artist - Album (A1) :: R-5 tracklist length (2) does not match the album\'s (1)'));
    });

    afterEach(resetActionStubs);
  });

  describe('Discogs search throws an exception', () => {
    beforeEach(function (done) {
      Object.assign(this, setup());
      this.discogs.db.search = sinon.stub().throws();
      this.logger.error = sinon.stub().callsFake(() => done());
      actions.finish = sinon.stub().callsFake(() => done());
      searchAlbum(this.discogs, () => this.logger)(album).start();
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    afterEach(resetActionStubs);
  });

  describe('Discogs results processing throws an exception', () => {
    beforeEach(function (done) {
      Object.assign(this, setup());
      this.discogs.db.search = sinon.stub().resolves({});
      this.logger.error = sinon.stub().callsFake(() => done());
      actions.finish = sinon.stub().callsFake(() => done());
      searchAlbum(this.discogs, () => this.logger)(album).start();
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    afterEach(resetActionStubs);
  });

  describe('Discogs search promise rejects', () => {
    beforeEach(function (done) {
      Object.assign(this, setup());
      this.discogs.db.search = sinon.stub().rejects(Error('ERROR'));
      actions.clearSearch = sinon.stub().callsFake(() => done());
      searchAlbum(this.discogs, () => this.logger)(album).start();
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
    describe('First page', () => {
      beforeEach(function (done) {
        Object.assign(this, setup(8, done));
        this.discogs.db = {
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
        searchAlbum(this.discogs, () => this.logger)(album).start();
      });

      it('Error logger is called', function () {
        assert(this.logger.error.calledOnce);
      });

      it('Error message is as expected', function () {
        assert(this.logger.error.getCalls()[0].args[0].endsWith('Artist - Album (A1) :: SEARCH P-1 TIMEOUT'));
      });

      it('search is called 3 times', function () {
        assert.equal(this.discogs.db.search.getCalls().length, 3);
      });

      it('search is NOT cleared', () => {
        assert.equal(actions.clearSearch.getCalls().length, 0);
      });

      afterEach(resetActionStubs);
    });

    describe('Second page', () => {
      beforeEach(function (done) {
        Object.assign(this, setup(8, done));
        this.discogs.db = {
          search: sinon.stub()
            .onCall(0)
            .resolves(pages[0])
            .onCall(1)
            .rejects({
              code: 'ETIMEDOUT',
              errno: 'ETIMEDOUT',
            })
            .onCall(2)
            .resolves(pages[1]),
          getRelease: sinon.stub().callsFake(id => Promise.resolve(blankRelease(id))),
        };
        searchAlbum(this.discogs, () => this.logger)(album).start();
      });

      it('Error logger is called', function () {
        assert(this.logger.error.calledOnce);
      });

      it('Error message is as expected', function () {
        assert(this.logger.error.getCalls()[0].args[0].endsWith('Artist - Album (A1) :: SEARCH P-2 TIMEOUT'));
      });

      it('search is called 3 times', function () {
        assert.equal(this.discogs.db.search.getCalls().length, 3);
      });

      it('search is NOT cleared', () => {
        assert.equal(actions.clearSearch.getCalls().length, 0);
      });

      afterEach(resetActionStubs);
    });
  });

  describe('Discogs release retrieval rejects because of timeout', () => {
    beforeEach(function (done) {
      Object.assign(this, setup(8, done));
      const releaseStub = sinon.stub().onCall(0).rejects({
        code: 'ETIMEDOUT',
        errno: 'ETIMEDOUT',
      });
      [1, 2, 3, 4, 5].forEach(id => releaseStub.onCall(id).resolves(blankRelease(id)));
      this.discogs.db = {
        search: sinon.stub()
          .onCall(0).resolves(pages[0])
          .onCall(1)
          .resolves(pages[1]),
        getRelease: releaseStub,
      };
      this.logger.finish = sinon.stub().callsFake(() => done());
      searchAlbum(this.discogs, () => this.logger)(album).start();
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    it('Error message is as expected', function () {
      assert(this.logger.error.getCalls()[0].args[0].endsWith('Artist - Album (A1) :: R-1 P-(1/2) TIMEOUT'));
    });

    it('getRelease is called 5 times', function () {
      assert.equal(this.discogs.db.getRelease.getCalls().length, 6);
    });

    it('search is NOT cleared', () => {
      assert.equal(actions.clearSearch.getCalls().length, 0);
    });

    afterEach(resetActionStubs);
  });

  describe('Discogs release retrieval rejects because of 429', () => {
    beforeEach(function (done) {
      Object.assign(this, setup(8, done));
      const releaseStub = sinon.stub().onCall(0).rejects({ statusCode: 429 });
      [1, 2, 3, 4, 5].forEach(id => releaseStub.onCall(id).resolves(blankRelease(id)));
      this.discogs = {
        db: {
          search: sinon.stub()
            .onCall(0).resolves(pages[0])
            .onCall(1)
            .resolves(pages[1]),
          getRelease: releaseStub,
        },
        PAUSE_NEEDED_AFTER_429: 1,
      };
      this.logger.finish = sinon.stub().callsFake(() => done());
      searchAlbum(this.discogs, () => this.logger)(album).start();
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    it('Error message is as expected', function () {
      assert(this.logger.error.getCalls()[0].args[0].endsWith('Artist - Album (A1) :: A 429 was thrown (too many requests). Search will pause for 0.001s'));
    });

    it('getRelease is called 5 times', function () {
      assert.equal(this.discogs.db.getRelease.getCalls().length, 6);
    });

    it('search is NOT cleared', () => {
      assert.equal(actions.clearSearch.getCalls().length, 0);
    });

    afterEach(resetActionStubs);
  });

  describe('Discogs search rejects because of 429', () => {
    beforeEach(function (done) {
      Object.assign(this, setup(8, done));
      this.discogs = {
        db: {
          search: sinon.stub()
            .onCall(0).rejects({ statusCode: 429 })
            .onCall(1)
            .resolves(pages[0])
            .onCall(2)
            .resolves(pages[1]),
          getRelease: sinon.stub().callsFake(id => Promise.resolve(blankRelease(id))),
        },
        PAUSE_NEEDED_AFTER_429: 1,
      };
      this.logger.finish = sinon.stub().callsFake(() => done());
      searchAlbum(this.discogs, () => this.logger)(album).start();
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    it('Error message is as expected', function () {
      assert(this.logger.error.getCalls()[0].args[0].endsWith('Artist - Album (A1) :: A 429 was thrown (too many requests). Search will pause for 0.001s'));
    });

    it('search is called 3 times', function () {
      assert.equal(this.discogs.db.search.getCalls().length, 3);
    });

    it('search is NOT cleared', () => {
      assert.equal(actions.clearSearch.getCalls().length, 0);
    });

    afterEach(resetActionStubs);
  });

  describe('Discogs get release rejects because of anything else', () => {
    beforeEach(function (done) {
      Object.assign(this, setup(8, done));
      this.discogs = {
        db: {
          search: sinon.stub().onCall(0).rejects({}),
        },
      };
      this.discogs = {
        db: {
          search: sinon.stub()
            .onCall(0)
            .resolves(pages[0])
            .onCall(1)
            .resolves(pages[1]),
          getRelease: sinon.stub().rejects(Error('BAD!!')),
        },
        PAUSE_NEEDED_AFTER_429: 1,
      };
      this.logger.error = sinon.stub().callsFake(() => done());
      searchAlbum(this.discogs, () => this.logger)(album).start();
    });

    it('Error logger is called', function () {
      assert(this.logger.error.calledOnce);
    });

    it('Error message is as expected', function () {
      assert(this.logger.error.getCalls()[0].args[0].includes('Artist - Album (A1) :: EXCEPTION. Search removed.'));
    });

    it('search is aborted', () => {
      assert(actions.removeSearch.calledOnce);
    });

    afterEach(resetActionStubs);
  });
});
