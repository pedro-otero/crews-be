const sinon = require('sinon');
const assert = require('assert');

const Discogs = require('./index');

describe('Find releases function', () => {
  it('calls the db functions', () => {
    const db = {
      search: sinon.spy(),
    };
    const discogs = new Discogs(db);
    discogs.findReleases({
      name: 'Album',
      artists: [{
        name: 'Artist',
      }],
    });
    assert(db.search.calledWith({
      release_title: 'Album',
      artist: 'Artist',
      type: 'release',
      page: 1,
      per_page: 100,
    }));
  });
});
