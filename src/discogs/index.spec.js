const sinon = require('sinon');
const assert = require('assert');

const Discogs = require('./index');

describe('Find releases function', () => {
  describe('calls the db functions', () => {
    before(function () {
      this.db = {
        search: sinon.stub()
          .onCall(0).resolves({
            pagination: {
              pages: 2,
              page: 1,
            },
            results: [{
              id: 1,
              title: 'Artist - Album',
              year: '2000',
            }],
          })
          .onCall(1)
          .resolves({
            pagination: {
              pages: 2,
              page: 2,
            },
            results: [{
              id: 2,
              title: 'Artist - Album',
              year: '2000',
            }],
          }),
        getRelease: sinon.stub().resolves({}),
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

    it('search 2nd page', function () {
      assert.deepEqual(this.db.search.getCalls()[1].args[0], {
        artist: 'Artist',
        release_title: 'Album',
        type: 'release',
        per_page: 100,
        page: 2,
      });
    });

    it('getRelease 1', function () {
      assert(this.db.getRelease.calledWith(1));
    });

    it('getRelease 2', function () {
      assert(this.db.getRelease.calledWith(2));
    });
  });
});
