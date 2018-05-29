const Album = require('./album.js');
const assert = require('assert');

const mockAlbum = require('./album.json');
const expectedAlbum = require('./expectedAlbum');

const album = new Album(mockAlbum);

describe('Album module', () => {
  it('creates albums', () => {
    assert.deepEqual(album, expectedAlbum);
  });
});
