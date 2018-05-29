const Album = require('./album.js');
const Track = require('./track');
const assert = require('assert');
const sinon = require('sinon');

const mockAlbum = require('./album.json');
const mockRelease = require('./release');
const expectedAlbum = require('./expectedAlbum');

const album = new Album(mockAlbum);
const addCreditsSpy = sinon.spy(Track.prototype, 'addCredit');

const exists = (trackId, name, role) => addCreditsSpy
  .getCalls()
  .find(({ args: [args], thisValue }) =>
    thisValue.id === (trackId || thisValue.id) &&
    args.name === (name || args.name) &&
    args.role === (role || args.role));

describe('Album module', () => {
  it('creates albums', () => {
    assert.deepEqual(album, expectedAlbum);
  });

  describe('credits splitting', () => {
    before(() => album.merge(mockRelease));

    it('adds credits 32 times', () => {
      assert.deepEqual(addCreditsSpy.getCalls().length, 32);
    });

    it('extracts single role track credit', () => {
      assert(exists('T1', 'P1', 'R1'));
    });

    it('extracts single role track credit', () => {
      assert(exists('T1', 'P1', 'R1'));
    });

    describe('extracts multi role track credit', () => {
      it('P2 worked on T2 as R21', () => {
        assert(exists('T2', 'P2', 'R21'));
      });

      it('P2 worked on T2 as R22', () => {
        assert(exists('T2', 'P2', 'R22'));
      });
    });

    it('extracts single role release credit', () => {
      assert(exists('T3', 'P3', 'R3'));
    });

    describe('extracts multi role release credit', () => {
      it('P4 worked on T4 as R41', () => {
        assert(exists('T4', 'P4', 'R41'));
      });

      it('P4 worked on T4 as R42', () => {
        assert(exists('T4', 'P4', 'R42'));
      });
    });

    describe('extracts hyphen-rage multi track release credit', () => {
      it('P567 worked on T5 as R51', () => {
        assert(exists('T5', 'P567', 'R51'));
      });

      it('P567 worked on T6 as R51', () => {
        assert(exists('T6', 'P567', 'R51'));
      });

      it('P567 worked on T7 as R51', () => {
        assert(exists('T7', 'P567', 'R51'));
      });

      it('No one worked on T8', () => {
        assert(!exists('T8'));
      });
    });

    describe('extracts comma separated multi track release credit', () => {
      it('P910 worked on T9 as R910', () => {
        assert(exists('T9', 'P910', 'R910'));
      });

      it('P920 worked on T10 as R910', () => {
        assert(exists('T10', 'P910', 'R910'));
      });
    });

    describe('extracts mixed range type multi track release credit', () => {
      it('P111315 worked on T11 as R111315', () => {
        assert(exists('T11', 'P111315', 'R111315'));
      });

      it('P111315 worked on T13 as R111315', () => {
        assert(exists('T13', 'P111315', 'R111315'));
      });

      it('P111315 worked on T14 as R111315', () => {
        assert(exists('T14', 'P111315', 'R111315'));
      });

      it('P111315 worked on T15 as R111315', () => {
        assert(exists('T15', 'P111315', 'R111315'));
      });

      it('No one worked on T12', () => {
        assert(!exists('T12'));
      });
    });

    it('Ignores release extra artists without role nor tracks', () => {
      assert(!exists(null, 'P16'));
    });

    it('Ignores release extra artists without tracks', () => {
      assert(!exists(null, 'P17'));
    });

    it('No one worked on track 16', () => {
      assert(!exists('T16'));
    });

    it('No one worked on track 17', () => {
      assert(!exists('T17'));
    });

    describe('extracts literal (with to) range type multi track release credit', () => {
      it('P181920 worked on T18 as R181920', () => {
        assert(exists('T18', 'P181920', 'R181920'));
      });

      it('P181920 worked on T19 as R181920', () => {
        assert(exists('T19', 'P181920', 'R181920'));
      });

      it('P181920 worked on T20 as R181920', () => {
        assert(exists('T20', 'P181920', 'R181920'));
      });
    });

    // In formats that have 2 sides (cassettes, LPs) or multiple units of the same
    // format type, positions can be described using non numeric strings such as:
    // A1, A2, A3, B1, B2...
    describe('Can work with non numeric positions in release credits', () => {
      it('individually', () => {
        assert(exists('T21', 'P21', 'R21'));
      });

      describe('in a range', () => {
        describe('literal', () => {
          it('P2223 worked on T22 as R2223', () => {
            assert(exists('T22', 'P2223', 'R2223'));
          });

          it('P2223 worked on T23 as R2223', () => {
            assert(exists('T23', 'P2223', 'R2223'));
          });
        });

        describe('hyphenated', () => {
          it('P2425 worked on T24 as R2425', () => {
            assert(exists('T24', 'P2425', 'R2425'));
          });

          it('P2425 worked on T25 as R2425', () => {
            assert(exists('T25', 'P2425', 'R2425'));
          });
        });
      });
    });

    describe('Can work with mixed multi ranges and position types', () => {
      it('P1 worked on T19 as R1', () => {
        assert(exists('T19', 'P1', 'R1'));
      });

      it('P1 worked on T20 as R1', () => {
        assert(exists('T20', 'P1', 'R1'));
      });

      it('P1 worked on T21 as R1', () => {
        assert(exists('T21', 'P1', 'R1'));
      });

      it('P1 worked on T23 as R1', () => {
        assert(exists('T23', 'P1', 'R1'));
      });

      it('P1 worked on T24 as R1', () => {
        assert(exists('T24', 'P1', 'R1'));
      });

      it('P1 worked on T25 as R1', () => {
        assert(exists('T25', 'P1', 'R1'));
      });
    });

    describe('Special roles', () => {
      it('has P26-1 as having worked as R22 for T26', () => {
        album.merge(mockRelease);
        assert(exists('T26', 'P26-1', 'Written-By'));
      });

      it('has P26-2 as having worked as "Produced By" for T26', () => {
        album.merge(mockRelease);
        assert(exists('T26', 'P26-2', 'Produced By'));
      });

      it('has P26-3 as having worked as feat. for T26', () => {
        album.merge(mockRelease);
        assert(exists('T26', 'P26-3', 'feat.'));
      });
    });
  });
});
