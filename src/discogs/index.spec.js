const sinon = require('sinon');
const assert = require('assert');

const Discogs = require('./index');

describe('Find releases function', () => {
  describe('calls the db functions', function () {
    beforeEach(() => {
      this.db = {
        search: sinon.spy(),
      };
      this.discogs = new Discogs(this.db);
      this.discogs.findReleases({
        name: 'Album',
        artists: [{
          name: 'Artist',
        }],
      });
    });

    it('search', () => {
      assert(this.db.search.calledWith({
        release_title: 'Album',
        artist: 'Artist',
        type: 'release',
        page: 1,
        per_page: 100,
      }));
    });
  });
});
