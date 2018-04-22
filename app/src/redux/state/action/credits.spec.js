const assert = require('assert');

const {
  ADD_CREDITS,
} = require('../action/constants');
const create = require('./credits');

describe('Credits action creator', () => {
  const album = {
    tracks: {
      items: [{ id: 'T1' }, { id: 'T2' }, { id: 'T3' }],
    },
  };

  describe('adds credits', () => {
    before(function () {
      const release = {
        extraartists: [{
          tracks: '3',
          name: 'P3',
          role: 'R3',
        }],
        tracklist: [{
          extraartists: [{
            name: 'P1',
            role: 'R1',
          }],
        }, {
          extraartists: [{
            name: 'P2',
            role: 'R21, R22',
          }],
        }, {
          position: '3',
        }],
      };
      this.action = create(album, release);
    });

    it('type', function () {
      assert.equal(this.action.type, ADD_CREDITS);
    });

    it('extracts single role track credit', function () {
      assert(!!this.action.credits.find(credit =>
        credit.track === 'T1' &&
        credit.name === 'P1' &&
        credit.role === 'R1'));
    });

    it('extracts single role track credit', function () {
      assert(!!this.action.credits.find(credit =>
        credit.track === 'T1' &&
        credit.name === 'P1' &&
        credit.role === 'R1'));
    });

    describe('extracts multi role track credit', () => {
      it('extracts multi role track credit', function () {
        assert(!!this.action.credits.find(credit =>
          credit.track === 'T2' &&
        credit.name === 'P2' &&
        credit.role === 'R21'));
      });

      it('extracts multi role track credit', function () {
        assert(!!this.action.credits.find(credit =>
          credit.track === 'T2' &&
        credit.name === 'P2' &&
        credit.role === 'R22'));
      });
    });

    it('extracts single role release credit', function () {
      assert(!!this.action.credits.find(credit =>
        credit.track === 'T3' &&
        credit.name === 'P3' &&
        credit.role === 'R3'));
    });
  });
});
