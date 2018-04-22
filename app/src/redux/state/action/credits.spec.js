const assert = require('assert');

const {
  ADD_CREDITS,
} = require('../action/constants');
const create = require('./credits');

describe('Credits action creator', () => {
  const album = {
    tracks: {
      items: [
        { id: 'T1' },
        { id: 'T2' },
        { id: 'T3' },
        { id: 'T4' },
        { id: 'T5' },
        { id: 'T6' },
        { id: 'T7' },
        { id: 'T8' },
        { id: 'T9' },
        { id: 'T10' },
      ],
    },
  };

  describe('adds credits', () => {
    before(function () {
      const release = {
        extraartists: [{
          tracks: '3',
          name: 'P3',
          role: 'R3',
        }, {
          tracks: '4',
          name: 'P4',
          role: 'R41, R42',
        }, {
          tracks: '5-7',
          name: 'P567',
          role: 'R51',
        }, {
          tracks: '9, 10',
          name: 'P910',
          role: 'R910',
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
        }, {
          position: '4',
        }, {
          position: '5',
        }, {
          position: '6',
        }, {
          position: '7',
        }, {
          position: '8',
        }, {
          position: '9',
        }, {
          position: '10',
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
      it('P2 worked on T2 as R21', function () {
        assert(!!this.action.credits.find(credit =>
          credit.track === 'T2' &&
        credit.name === 'P2' &&
        credit.role === 'R21'));
      });

      it('P2 worked on T2 as R22', function () {
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

    describe('extracts multi role release credit', () => {
      it('P4 worked on T4 as R41', function () {
        assert(!!this.action.credits.find(credit =>
          credit.track === 'T4' &&
          credit.name === 'P4' &&
          credit.role === 'R41'));
      });

      it('P4 worked on T4 as R42', function () {
        assert(!!this.action.credits.find(credit =>
          credit.track === 'T4' &&
          credit.name === 'P4' &&
          credit.role === 'R42'));
      });
    });

    describe('extracts hyphen-rage multi track release credit', () => {
      it('P567 worked on T5 as R51', function () {
        assert(!!this.action.credits.find(credit =>
          credit.track === 'T5' &&
          credit.name === 'P567' &&
          credit.role === 'R51'));
      });

      it('P567 worked on T6 as R51', function () {
        assert(!!this.action.credits.find(credit =>
          credit.track === 'T6' &&
          credit.name === 'P567' &&
          credit.role === 'R51'));
      });

      it('P567 worked on T7 as R51', function () {
        assert(!!this.action.credits.find(credit =>
          credit.track === 'T7' &&
          credit.name === 'P567' &&
          credit.role === 'R51'));
      });

      it('No one worked on T8', function () {
        assert(!this.action.credits.find(credit => credit.track === 'T8'));
      });
    });

    describe('extracts comma separated multi track release credit', () => {
      it('P910 worked on T9 as R910', function () {
        assert(!!this.action.credits.find(credit =>
          credit.track === 'T9' &&
          credit.name === 'P910' &&
          credit.role === 'R910'));
      });

      it('P920 worked on T10 as R910', function () {
        assert(!!this.action.credits.find(credit =>
          credit.track === 'T10' &&
          credit.name === 'P910' &&
          credit.role === 'R910'));
      });
    });
  });
});
