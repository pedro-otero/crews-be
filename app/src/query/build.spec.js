const build = require('./build');
const assert = require('assert');

describe('Build', () => {
  describe('creates an empty bundle with an empty album', () => {
    before(function () {
      const credits = [{}];
      const album = { tracks: [] };
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
        tracks: [{
          id: 'T1',
          name: 'Track 1',
        }],
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
      }, {
        name: 'P2',
        role: 'Producer',
        track: 'T1',
      }, {
        name: 'P4',
        role: 'Composer',
        track: 'T1',
      }, {
        name: 'P3',
        role: 'Featured',
        track: 'T1',
      }];
      const album = {
        tracks: [{
          id: 'T1',
          name: 'Track 1',
        }],
      };
      this.bundle = build(album, credits);
    });

    it('has P1 as R1 of T1', function () {
      assert.equal(this.bundle.tracks[0].credits.P1[0], 'R1');
    });

    it('has P2 as Producer of T1', function () {
      assert.equal(this.bundle.tracks[0].producers[0], 'P2');
    });

    it('has P4 as Composer of T1', function () {
      assert.equal(this.bundle.tracks[0].composers[0], 'P4');
    });

    it('has P3 as featured artist of T1', function () {
      assert.equal(this.bundle.tracks[0].featured[0], 'P3');
    });

    it('does not put P2 (producer) in the general credits list', function () {
      assert(!Object.keys(this.bundle.tracks[0].credits).includes('P2'));
    });

    it('does not put P2 (featured artist) in the general credits list', function () {
      assert(!Object.keys(this.bundle.tracks[0].credits).includes('P3'));
    });

    it('does not put P4 (composer) in the general credits list', function () {
      assert(!Object.keys(this.bundle.tracks[0].credits).includes('P4'));
    });
  });
});
