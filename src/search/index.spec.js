const sinon = require('sinon');
const assert = require('assert');

const search = require('./index');

const spotify = Promise.resolve({
  getAlbum: sinon.stub().resolves({})
});

const discogs = {
  findReleases: () => Rx.Observable.create(observer => {
    observer.next({});
    observer.next({});
    observer.complete();
  })
};

describe('Search function', function () {
  it('Returns a newly created search', function () {
    const result = search(spotify, 1, discogs);
    assert.equal(1, result.id);
  });
});
