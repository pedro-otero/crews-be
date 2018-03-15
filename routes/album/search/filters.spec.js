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

  describe('title', function () {
    it('true', function () {
      assert.deepEqual(this.matchAlbum.byTitle({
        title: 'Artist - Album'
      }), {
        match: true
      });
    });

    it('false', function () {
      assert.deepEqual(this.matchAlbum.byTitle({
        title: 'Artist - Some other album'
      }), {
        match: false
      });
    });
  });

  describe('exact title', function () {
    it('true', function () {
      assert.deepEqual(this.matchAlbum.byExactTitle({
        title: 'Artist - Album'
      }), {
        match: true
      });
    });

    it('false', function () {
      assert.deepEqual(this.matchAlbum.byExactTitle({
        title: 'Artist - Some other album'
      }), {
        match: false
      });
    });
  });

  describe('format', function () {
    describe('as array', function () {
      it('true', function () {
        assert.deepEqual(this.matchAlbum.byFormat({
          format: ['album']
        }), {
          match: true
        });
      });

      it('false', function () {
        assert.deepEqual(this.matchAlbum.byFormat({
          format: ['LP']
        }), {
          match: false
        });
      });
    });

    describe('as string', function () {
      it('true', function () {
        assert.deepEqual(this.matchAlbum.byFormat({
          format: 'album'
        }), {
          match: true
        });
      });

      it('false', function () {
        assert.deepEqual(this.matchAlbum.byFormat({
          format: 'LP'
        }), {
          match: false
        });
      });
    });
  });

  describe('year', function () {
    describe('only year in release_date', function () {
      it('true', function () {
        assert.deepEqual(this.matchAlbum.byYear({
          year: '2012'
        }), {
          match: true
        });
      });

      it('false', function () {
        assert.deepEqual(this.matchAlbum.byYear({
          year: '2011'
        }), {
          match: false
        });
      });
    });

    describe('full date in release_date', function () {
      beforeEach(function () {
        this.matchAlbum.release_date = '2012-04-25';
      });

      it('true', function () {
        assert.deepEqual(this.matchAlbum.byYear({
          year: '2012'
        }), {
          match: true
        });
      });

      it('false', function () {
        assert.deepEqual(this.matchAlbum.byYear({
          year: '2011'
        }), {
          match: false
        });
      });
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

  describe('release date', function() {
    before(function () {
      this.matchAlbum = match({release_date: '2012-04-25'});
    });

    it('true', function () {
      assert.deepEqual(this.matchAlbum.byReleaseDate({
        released: '2012-04-25'
      }), {
        match: true
      });
    });

    it('false', function () {
      assert.deepEqual(this.matchAlbum.byReleaseDate({
        released: '2011'
      }), {
        match: false
      });
    });
  });

});