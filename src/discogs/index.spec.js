const sinon = require('sinon');
const assert = require('assert');

const Discogs = require('./index');
const { actions } = require('../redux/state/index');

const firstResults = {
  pagination: {
    pages: 2,
    page: 1,
  },
  results: [{
    id: 1,
    title: 'Artist - Album',
    year: '2000',
  }],
};

const secondResults = {
  pagination: {
    pages: 2,
    page: 2,
  },
  results: [{
    id: 2,
    title: 'Artist - Album',
    year: '2000',
  }],
};

describe('Find releases function', () => {
  describe('calls the db and actions functions', () => {
    before(function () {
      actions.addRelease = sinon.spy();
      actions.releaseResults = sinon.spy();
      this.db = {
        search: sinon.stub()
          .onCall(0).resolves(firstResults)
          .onCall(1)
          .resolves(secondResults),
        getRelease: sinon.stub()
          .onCall(0).resolves({ id: 1 })
          .onCall(1)
          .resolves({ id: 2 }),
      };
      this.discogs = new Discogs(this.db);
      this.discogs.findReleases({
        name: 'Album',
        artists: [{
          name: 'Artist',
        }],
        release_date: '2000',
        album_type: 'album',
      });
    });

    it('search 1st page', function () {
      assert.deepEqual(this.db.search.getCalls()[0].args[0], {
        artist: 'Artist',
        release_title: 'Album',
        type: 'release',
        per_page: 100,
        page: 1,
      });
    });

    it('adds 1st page of results to store', () => {
      assert.deepEqual(actions.releaseResults.getCalls()[0].args[1], firstResults);
    });

    it('search 2nd page', function () {
      assert.deepEqual(this.db.search.getCalls()[1].args[0], {
        artist: 'Artist',
        release_title: 'Album',
        type: 'release',
        per_page: 100,
        page: 2,
      });
    });

    it('adds 2nd page of results to store', () => {
      assert.deepEqual(actions.releaseResults.getCalls()[1].args[1], secondResults);
    });

    it('getRelease 1', function () {
      assert(this.db.getRelease.calledWith(1));
    });

    it('addRelease 1', () => {
      assert.deepEqual(actions.addRelease.getCalls(0)[0].args[0], { id: 1 });
    });

    it('getRelease 2', function () {
      assert(this.db.getRelease.calledWith(2));
    });

    it('addRelease 2', () => {
      assert.deepEqual(actions.addRelease.getCalls(0)[1].args[0], { id: 2 });
    });
  });
});
