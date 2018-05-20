const assert = require('assert');

const {
  ADD_ALBUM,
} = require('./constants');
const create = require('./albums');

describe('Albums action creators', () => {
  context('creates add album action', () => {
    before(function () {
      this.action = create({
        id: 1,
        name: 'Album name',
        artists: [{ name: 'The Artist' }],
        tracks: {
          items: [{ id: 'T1' }],
        },
      });
    });

    it('sets ADD_ALBUM type', function () {
      assert.equal(this.action.type, ADD_ALBUM);
    });

    it('sets album id', function () {
      assert.equal(this.action.album.id, 1);
    });

    it('sets album name', function () {
      assert.equal(this.action.album.name, 'Album name');
    });

    it('sets album artist', function () {
      assert.equal(this.action.album.artist, 'The Artist');
    });

    it('removes pagination from tracks and makes it an aray', function () {
      assert.equal(this.action.album.tracks[0].id, 'T1');
    });
  });
});
