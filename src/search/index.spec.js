const sinon = require('sinon');
const assert = require('assert');

const search = require('./index');

const discogs = {
  findReleases: () => Rx.Observable.create((observer) => {
    observer.next({});
    observer.next({});
    observer.complete();
  }),
};

const store = {
  getState: () => ({ searches: [] }),
};

describe('Search function', () => {
  describe('Spotify getAlbum exists', () => {
    beforeEach(function () {
      const spotify = Promise.resolve({
        getAlbum: sinon.stub().resolves({}),
      });
      this.search = search(spotify, discogs, store);
    });

    it('Returns a newly created search', function (done) {
      this.search(1)
        .then(result => assert.equal(1, result.id))
        .then(done)
        .catch(() => assert(false));
    });
  });

  describe('Spotify album does not exist', () => {
    beforeEach(function () {
      const spotify = Promise.resolve({
        getAlbum: () => Promise.reject({
          error: {
            status: 404,
          },
        }),
      });
      this.search = search(spotify, discogs, store);
    });

    it('Returns error with message', function (done) {
      this.search(1)
        .then(() => {
          assert(false);
        }, (err) => {
          assert.equal(err.message, 'Album does not exist in Spotify');
        })
        .then(done)
        .catch(() => {
          assert(false);
          done();
        });
    });
  });
});
