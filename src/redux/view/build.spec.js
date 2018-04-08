const build = require('./build');
const assert = require('assert');

describe('Build', () => {
  describe('creates a bundle from album and release information', () => {
    before(function () {
      this.album = {
        tracks: {
          items: [{
            name: 'Some track',
          }],
        },
      };
      this.release = {
        extraartists: [{
          name: 'P2',
          role: 'Produced By',
          tracks: '1',
        }, {
          name: 'C2',
          role: 'Lyrics By',
          tracks: '1',
        }, {
          name: 'F2',
          role: 'Featuring',
          tracks: '1',
        }, {
          name: 'A2',
          role: 'other instrument',
          tracks: '1',
        }],
        tracklist: [{
          title: 'Some track',
          position: '1',
          extraartists: [{
            name: 'P1',
            role: 'Producer',
          }, {
            name: 'C1',
            role: 'Written-By',
          }, {
            name: 'F1',
            role: 'feat.',
          }, {
            name: 'A1',
            role: 'Some instrument',
          }],
        }],
      };
      this.built = build(this.album, this.release);
    });

    it('sets title', function () {
      assert.equal(this.album.name,this.built.title);
    });

    describe('builds tracks', () => {
      it('sets title', function () {
        assert.equal(this.album.tracks.items[0].name,this.built.tracks[0].title);
      });

      it('adds producers that are in the release track', function () {
        assert(this.built.tracks[0].producers.includes('P1'));
      });

      it('adds producers that are in the release', function () {
        assert(this.built.tracks[0].producers.includes('P2'));
      });

      it('adds composers that are in the release track', function () {
        assert(this.built.tracks[0].composers.includes('C1'));
      });

      it('adds composers that are in the release', function () {
        assert(this.built.tracks[0].composers.includes('C2'));
      });

      it('adds featured artists that are in the release track', function () {
        assert(this.built.tracks[0].featured.includes('F1'));
      });

      it('adds featured artists that are in the release', function () {
        assert(this.built.tracks[0].featured.includes('F2'));
      });

      it('adds credits that are in the release track', function () {
        assert(Object.keys(this.built.tracks[0].credits).includes('A1'));
        assert(this.built.tracks[0].credits.A1.includes('Some instrument'));
      });

      it('adds credits that are in the release', function () {
        assert(Object.keys(this.built.tracks[0].credits).includes('A2'));
        assert(this.built.tracks[0].credits.A2.includes('other instrument'));
      });
    });
  });

  describe('works with x to y track string in release extra artists', () => {
    beforeEach(function () {
      this.album = {
        tracks: {
          items: [{
            name: 'Track 1',
          }, {
            name: 'Track 2',
          }, {
            name: 'Track 3',
          }],
        },
      };
      this.release = {
        extraartists: [{
          name: 'P1',
          role: 'Produced By',
          tracks: '1 to 3',
        }],
        tracklist: [{
          title: 'Track 1',
          position: '1',
          extraartists: [],
        }, {
          title: 'Track 2',
          position: '2',
          extraartists: [],
        }, {
          title: 'Track 3',
          position: '3',
          extraartists: [],
        }],
      };
      this.built = build(this.album, this.release);
    });

    it('built bundle has 3 tracks', function () {
      assert.equal(3, this.built.tracks.length);
    });

    it('built bundle has P1 as producer of Track 1', function () {
      assert.equal('P1', this.built.tracks[0].producers[0]);
    });

    it('built bundle has P1 as producer of Track 2', function () {
      assert.equal('P1', this.built.tracks[1].producers[0]);
    });

    it('built bundle has P1 as producer of Track 3', function () {
      assert.equal('P1', this.built.tracks[2].producers[0]);
    });
  });
});
