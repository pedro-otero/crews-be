const assert = require('assert');
const match = require('./filters');

describe('Filter by', function() {

  before(function () {
    this.matchAlbum = match({
      name: 'Album',
      artists: [{ name: 'ARTIST' }],
      album_type: 'album',
      release_date: '2012',
      tracks: { items: [
        { name: 'TRACK #1' },
        { name: 'TRACK #2 - INTERLUDE' },
        { name: 'TRACK #3 (NAME IN PARENTHESES)' },
        { name: '(PRECEDING PARENTHESIS) TRACK #4' },
        { name: "TRACK #5 (Stuff that's not in the release)" },
        { name: "TRACK #6 - Stuff that's not in the release" },
        { name: 'TRACK #7' },
        { name: 'TRACK #8' }
      ]}
    });
  });

  it('tracklist', function() {
    assert.deepEqual(this.matchAlbum.byTracklist({
      tracklist: [
        { title: 'Track #1' },
        { title: 'track #2 (Interlude)' },
        { title: 'track #3 - Name in parentheses' },
        { title: '(Preceding parenthesis) track #4' },
        { title: 'track #5' },
        { title: 'track #6' },
        { title: "track #7 (Stuff that's not in the release)" },
        { title: "track #8 - Stuff that's not in the release" }
      ]}), {
      match: true
    });
  });

});