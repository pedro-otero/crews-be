const assert = require('assert');

const {
  ADD_ALBUM,
} = require('../action/constants');
const reduce = require('./albums');

describe('Albums reducer', function () {

  const addAlbum = id => function () {
    this.albums = reduce([], {
      type: ADD_ALBUM,
      album: { id }
    });
  };

  describe(ADD_ALBUM, function () {
    beforeEach(addAlbum('albumId'));

    it('Pushes albums', function () {
      assert.equal(1, this.albums.length);
    });

    it('Creates a request with the same id as the album', function () {
      assert.equal('albumId', this.albums[0].id);
    });
  });
});
