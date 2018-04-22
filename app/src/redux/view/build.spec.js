const build = require('./build');
const assert = require('assert');

describe('Build', () => {
  describe('creates an empty bundle with an empty album', () => {
    before(function () {
      const credits = [{}];
      const album = { tracks: { items: [] } };
      this.bundle = build(album, credits);
    });

    it('has 0 tracks', function () {
      assert.equal(this.bundle.tracks.length, 0);
    });
  });

  describe('creates an empty bundle with an list of credits', () => {
    before(function () {
      const credits = [{}];
      const album = {
        tracks: {
          items: [{
            id: 'T1',
            name: 'Track 1',
          }],
        },
      };
      this.bundle = build(album, credits);
    });

    it('has 1 track', function () {
      assert.equal(this.bundle.tracks.length, 1);
    });

    it('track has title', function () {
      assert.equal(this.bundle.tracks[0].title, 'Track 1');
    });

    it('track has id', function () {
      assert.equal(this.bundle.tracks[0].id, 'T1');
    });

    it('track has no producers', function () {
      assert.equal(this.bundle.tracks[0].producers.length, 0);
    });

    it('track has no composers', function () {
      assert.equal(this.bundle.tracks[0].composers.length, 0);
    });

    it('track has no featured artists', function () {
      assert.equal(this.bundle.tracks[0].featured.length, 0);
    });

    it('track has no credits', function () {
      assert.equal(Object.keys(this.bundle.tracks[0].credits).length, 0);
    });
  });

  describe('creates a bundle from a list of credits', () => {
    before(function () {
      const credits = [{
        name: 'P1',
        role: 'R1',
        track: 'T1',
      }];
      const album = {
        tracks: {
          items: [{
            id: 'T1',
            name: 'Track 1',
          }],
        },
      };
      this.bundle = build(album, credits);
    });

    it('has P1 as R1 of T1', function () {
      assert.equal(this.bundle.tracks[0].credits.P1[0], 'R1');
    });
  });
});
