const assert = require('assert');

const {
  ADD_CREDITS,
} = require('../action/constants');
const create = require('./credits');

describe('Credits action creator', () => {
  const exists = (credits, track, name, role) => credits.find(credit =>
    credit.track === track &&
    credit.name === name &&
    credit.role === role);

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
        { id: 'T11' },
        { id: 'T12' },
        { id: 'T13' },
        { id: 'T14' },
        { id: 'T15' },
        { id: 'T16' },
        { id: 'T17' },
        { id: 'T18' },
        { id: 'T19' },
        { id: 'T20' },
        { id: 'T21' },
        { id: 'T22' },
        { id: 'T23' },
        { id: 'T24' },
        { id: 'T25' },
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
        }, {
          tracks: '11, 13-15',
          name: 'P111315',
          role: 'R111315',
        }, {
          name: 'P16',
        }, {
          name: 'P17',
          role: 'R17',
        }, {
          name: 'P181920',
          role: 'R181920',
          tracks: '18 to 20',
        }, {
          name: 'P21',
          role: 'R21',
          tracks: 'Pos21',
        }, {
          name: 'P2223',
          role: 'R2223',
          tracks: 'Pos22 to Pos23',
        }, {
          name: 'P2425',
          role: 'R2425',
          tracks: 'Pos24-Pos25',
        }, {
          name: 'P1',
          role: 'R1',
          tracks: '19 to Pos21, Pos23, Pos24-Pos25',
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
        }, {
          position: '11',
        }, {
          position: '12',
        }, {
          position: '13',
        }, {
          position: '14',
        }, {
          position: '15',
        }, {
          position: '16',
        }, {
          position: '17',
        }, {
          position: '18',
        }, {
          position: '19',
        }, {
          position: '20',
        }, {
          position: 'Pos21',
        }, {
          position: 'Pos22',
        }, {
          position: 'Pos23',
        }, {
          position: 'Pos24',
        }, {
          position: 'Pos25',
        }],
      };
      this.action = create(album, release);
    });

    it('type', function () {
      assert.equal(this.action.type, ADD_CREDITS);
    });

    it('extracts single role track credit', function () {
      assert(exists(this.action.credits, 'T1', 'P1', 'R1'));
    });

    it('extracts single role track credit', function () {
      assert(exists(this.action.credits, 'T1', 'P1', 'R1'));
    });

    describe('extracts multi role track credit', () => {
      it('P2 worked on T2 as R21', function () {
        assert(exists(this.action.credits, 'T2', 'P2', 'R21'));
      });

      it('P2 worked on T2 as R22', function () {
        assert(exists(this.action.credits, 'T2', 'P2', 'R22'));
      });
    });

    it('extracts single role release credit', function () {
      assert(exists(this.action.credits, 'T3', 'P3', 'R3'));
    });

    describe('extracts multi role release credit', () => {
      it('P4 worked on T4 as R41', function () {
        assert(exists(this.action.credits, 'T4', 'P4', 'R41'));
      });

      it('P4 worked on T4 as R42', function () {
        assert(exists(this.action.credits, 'T4', 'P4', 'R42'));
      });
    });

    describe('extracts hyphen-rage multi track release credit', () => {
      it('P567 worked on T5 as R51', function () {
        assert(exists(this.action.credits, 'T5', 'P567', 'R51'));
      });

      it('P567 worked on T6 as R51', function () {
        assert(exists(this.action.credits, 'T6', 'P567', 'R51'));
      });

      it('P567 worked on T7 as R51', function () {
        assert(exists(this.action.credits, 'T7', 'P567', 'R51'));
      });

      it('No one worked on T8', function () {
        assert(!this.action.credits.find(credit => credit.track === 'T8'));
      });
    });

    describe('extracts comma separated multi track release credit', () => {
      it('P910 worked on T9 as R910', function () {
        assert(exists(this.action.credits, 'T9', 'P910', 'R910'));
      });

      it('P920 worked on T10 as R910', function () {
        assert(exists(this.action.credits, 'T10', 'P910', 'R910'));
      });
    });

    describe('extracts mixed range type multi track release credit', () => {
      it('P111315 worked on T11 as R111315', function () {
        assert(exists(this.action.credits, 'T11', 'P111315', 'R111315'));
      });

      it('P111315 worked on T13 as R111315', function () {
        assert(exists(this.action.credits, 'T13', 'P111315', 'R111315'));
      });

      it('P111315 worked on T14 as R111315', function () {
        assert(exists(this.action.credits, 'T14', 'P111315', 'R111315'));
      });

      it('P111315 worked on T15 as R111315', function () {
        assert(exists(this.action.credits, 'T15', 'P111315', 'R111315'));
      });

      it('No one worked on T12', function () {
        assert(!this.action.credits.find(credit => credit.track === 'T12'));
      });
    });

    it('Ignores release extra artists without role nor tracks', function () {
      assert(!this.action.credits.find(credit => credit.name === 'P16'));
    });

    it('Ignores release extra artists without tracks', function () {
      assert(!this.action.credits.find(credit => credit.name === 'P17'));
    });

    it('No one worked on track 16', function () {
      assert(!this.action.credits.find(credit => credit.track === 'T16'));
    });

    it('No one worked on track 17', function () {
      assert(!this.action.credits.find(credit => credit.track === 'T17'));
    });

    describe('extracts literal (with to) range type multi track release credit', () => {
      it('P181920 worked on T18 as R181920', function () {
        assert(exists(this.action.credits, 'T18', 'P181920', 'R181920'));
      });

      it('P181920 worked on T19 as R181920', function () {
        assert(exists(this.action.credits, 'T19', 'P181920', 'R181920'));
      });

      it('P181920 worked on T20 as R181920', function () {
        assert(exists(this.action.credits, 'T20', 'P181920', 'R181920'));
      });
    });

    // In formats that have 2 sides (cassettes, LPs) or multiple units of the same
    // format type, positions can be described using non numeric strings such as:
    // A1, A2, A3, B1, B2...
    describe('Can work with non numeric positions in release credits', () => {
      it('individually', function () {
        assert(exists(this.action.credits, 'T21', 'P21', 'R21'));
      });

      describe('in a range', () => {
        describe('literal', () => {
          it('P2223 worked on T22 as R2223', function () {
            assert(exists(this.action.credits, 'T22', 'P2223', 'R2223'));
          });

          it('P2223 worked on T23 as R2223', function () {
            assert(exists(this.action.credits, 'T23', 'P2223', 'R2223'));
          });
        });

        describe('hyphenated', () => {
          it('P2425 worked on T24 as R2425', function () {
            assert(exists(this.action.credits, 'T24', 'P2425', 'R2425'));
          });

          it('P2425 worked on T25 as R2425', function () {
            assert(exists(this.action.credits, 'T25', 'P2425', 'R2425'));
          });
        });
      });
    });

    describe('Can work with mixed multi ranges and position types', () => {
      it('P1 worked on T19 as R1', function () {
        assert(exists(this.action.credits, 'T19', 'P1', 'R1'));
      });

      it('P1 worked on T20 as R1', function () {
        assert(exists(this.action.credits, 'T20', 'P1', 'R1'));
      });

      it('P1 worked on T21 as R1', function () {
        assert(exists(this.action.credits, 'T21', 'P1', 'R1'));
      });

      it('P1 worked on T23 as R1', function () {
        assert(exists(this.action.credits, 'T23', 'P1', 'R1'));
      });

      it('P1 worked on T24 as R1', function () {
        assert(exists(this.action.credits, 'T24', 'P1', 'R1'));
      });

      it('P1 worked on T25 as R1', function () {
        assert(exists(this.action.credits, 'T25', 'P1', 'R1'));
      });
    });
  });
});
