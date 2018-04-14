const sinon = require('sinon');
const assert = require('assert');

const Discogs = require('./discogs');

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
    before(function (done) {
      this.values = [];
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
      }).subscribe(this.values.push.bind(this.values), () => assert(false), done);
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

    it('emits first page of results', function () {
      assert.deepEqual(this.values[0].data, firstResults);
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

    it('emits second page of results', function () {
      assert.deepEqual(this.values[2].data, secondResults);
    });

    it('getRelease 1', function () {
      assert(this.db.getRelease.calledWith(1));
    });

    it('emits release 1', function () {
      assert.equal(this.values[1].data.release.id, 1);
    });

    it('getRelease 2', function () {
      assert(this.db.getRelease.calledWith(2));
    });

    it('emits release 2', function () {
      assert.equal(this.values[3].data.release.id, 2);
    });
  });
});