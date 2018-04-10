const sinon = require('sinon');
const assert = require('assert');

const Discogs = require('./index');

describe('Find releases function', () => {
  describe('calls the db functions', () => {
    before(function () {
      this.db = {
        search: sinon.stub().resolves({
          pagination: {
            pages: 1,
            page: 1,
          },
          results: [{
            id: 1,
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

    it('search', function () {
      assert(this.db.search.calledWith({
        release_title: 'Album',
        artist: 'Artist',
        type: 'release',
        page: 1,
        per_page: 100,
      }));
    });

    it('getRelease', function () {
      assert(this.db.getRelease.calledWith(1));
    });
  });
});
