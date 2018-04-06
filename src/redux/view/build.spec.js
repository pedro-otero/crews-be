const build = require('./build');
const expect = require('../../../node_modules/expect.js/expect');
const assert = require('assert');

describe('Build', function () {
  describe('creates a bundle from album and release information', function () {

    before(function () {
      this.album = {
        tracks: {
          items: [{
            name: 'Some track',
          }]
        }
      };
      this.release = {
        extraartists: [{
          name: 'P2',
          role: 'Produced By',
          tracks: '1'
        }, {
          name: 'C2',
          role: 'Lyrics By',
          tracks: '1'
        }, {
          name: 'F2',
          role: 'Featuring',
          tracks: '1'
        }, {
          name: 'A2',
          role: 'other instrument',
          tracks: '1'
        }],
        tracklist: [{
          title: 'Some track',
          position: '1',
          extraartists: [{
            name: 'P1',
            role: 'Producer'
          }, {
            name: 'C1',
            role: 'Written-By'
          }, {
            name: 'F1',
            role: 'feat.'
          }, {
            name: 'A1',
            role: 'Some instrument'
          }]
        }]
      };
      this.built = build(this.album, this.release);
    });

    it('sets title', function () {
      expect(this.built.title).to.equal(this.album.name);
    });

    describe('builds tracks', function () {

      it('sets title', function () {
        expect(this.built.tracks[0].title).to.equal(this.album.tracks.items[0].name);
      });

      it('adds producers that are in the release track', function () {
        expect(this.built.tracks[0].producers).to.contain('P1');
      });

      it('adds producers that are in the release', function () {
        expect(this.built.tracks[0].producers).to.contain('P2');
      });

      it('adds composers that are in the release track', function () {
        expect(this.built.tracks[0].composers).to.contain('C1');
      });

      it('adds composers that are in the release', function () {
        expect(this.built.tracks[0].composers).to.contain('C2');
      });

      it('adds featured artists that are in the release track', function () {
        expect(this.built.tracks[0].featured).to.contain('F1');
      });

      it('adds featured artists that are in the release', function () {
        expect(this.built.tracks[0].featured).to.contain('F2');
      });

      it('adds credits that are in the release track', function () {
        expect(this.built.tracks[0].credits).to.have.property('A1');
        expect(this.built.tracks[0].credits['A1']).to.contain('Some instrument');
      });

      it('adds credits that are in the release', function () {
        expect(this.built.tracks[0].credits).to.have.property('A2');
        expect(this.built.tracks[0].credits['A2']).to.contain('other instrument');
      });

    });
  });

  describe('works with x-y track string in release extra artists', function () {
    beforeEach(function () {
      this.album = {
        tracks: {
          items: [{
            name: 'Track 1',
          }, {
            name: 'Track 2',
          }, {
            name: 'Track 3',
          },]
        }
      };
      this.release = {
        extraartists: [{
          name: 'P2',
          role: 'Produced By',
          tracks: '1-3'
        }],
        tracklist: [{
          title: 'Track 1',
          position: '1',
          extraartists: []
        }, {
          title: 'Track 2',
          position: '2',
          extraartists: []
        }, {
          title: 'Track 3',
          position: '3',
          extraartists: []
        },]
      };
      this.built = build(this.album, this.release);
    });

    it('built bundle has 3 tracks', function () {
      assert.equal(3, this.built.tracks.length);
    });
  });
});
