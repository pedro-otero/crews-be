const assert = require('assert');

const {
  ADD_CREDITS,
} = require('../action/constants');
const create = require('./credits');

describe('Credits action creator', () => {
  const album = {
    tracks: {
      items: [{ id: 'T1' }],
    },
  };

  describe('adds credits', () => {
    before(function () {
      const release = {
        tracklist: [{
          extraartists: [{
            name: 'P1',
            role: 'R1',
          }],
        }],
      };
      this.action = create(album, release);
    });

    it('type', function () {
      assert.equal(this.action.type, ADD_CREDITS);
    });

    it('extract single role track credit', function () {
      assert(!!this.action.credits.find(credit =>
        credit.track === 'T1' &&
        credit.name === 'P1' &&
        credit.role === 'R1'));
    });
  });
});
