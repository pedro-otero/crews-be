const assert = require('assert');

const createState = require('./index');

describe('State module', () => {
  const state = createState();

  it('adds albums', () => {
    state.addAlbum({
      id: 1,
      name: 'Album name',
      artists: [{ name: 'The Artist' }],
      tracks: {
        items: [{ id: 'T1', name: 'Track #1', x: 'y' }],
      },
    });
    assert.deepEqual(state.data().albums[0], {
      id: 1,
      name: 'Album name',
      artist: 'The Artist',
      tracks: [{ id: 'T1', name: 'Track #1' }],
    });
  });

  describe('searches', () => {
    before(() => {
      state.addSearch('S1');
    });

    it('adds', () => {
      assert.deepEqual(state.data().searches, [{ id: 'S1' }]);
    });

    it('sets last search page', () => {
      state.setLastSearchPage('S1', {
        pagination: {
          page: 1,
          pages: 2,
          items: 500,
          per_page: 100,
        },
        results: [{ id: 1 }],
      });
      assert.deepEqual(state.data().searches[0].lastSearchPage, {
        page: 1,
        pages: 2,
        items: 500,
        perPage: 100,
        releases: [1],
      });
    });

    it('sets last release', () => {
      state.setLastRelease('S1', { id: 5 });
      assert.equal(state.data().searches[0].lastRelease, 5);
    });

    const album = {
      tracks: [
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
        { id: 'T26' },
      ],
    };

    describe('Credits', () => {
      const exists = (credits, track, name, role) => credits.find(credit =>
        credit.track === track &&
        credit.name === name &&
        credit.role === role);

      describe('adds credits', () => {
        before(() => {
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
            }, {
              position: '26',
              extraartists: [{
                name: 'P26-1',
                role: 'Written-By',
              }, {
                name: 'P26-2',
                role: 'Produced By',
              }, {
                name: 'P26-3',
                role: 'feat.',
              }],
            }],
          };
          state.addCredits(album, release);
        });

        it('extracts single role track credit', () => {
          assert(exists(state.data().credits, 'T1', 'P1', 'R1'));
        });

        it('extracts single role track credit', () => {
          assert(exists(state.data().credits, 'T1', 'P1', 'R1'));
        });

        describe('extracts multi role track credit', () => {
          it('P2 worked on T2 as R21', () => {
            assert(exists(state.data().credits, 'T2', 'P2', 'R21'));
          });

          it('P2 worked on T2 as R22', () => {
            assert(exists(state.data().credits, 'T2', 'P2', 'R22'));
          });
        });

        it('extracts single role release credit', () => {
          assert(exists(state.data().credits, 'T3', 'P3', 'R3'));
        });

        describe('extracts multi role release credit', () => {
          it('P4 worked on T4 as R41', () => {
            assert(exists(state.data().credits, 'T4', 'P4', 'R41'));
          });

          it('P4 worked on T4 as R42', () => {
            assert(exists(state.data().credits, 'T4', 'P4', 'R42'));
          });
        });

        describe('extracts hyphen-rage multi track release credit', () => {
          it('P567 worked on T5 as R51', () => {
            assert(exists(state.data().credits, 'T5', 'P567', 'R51'));
          });

          it('P567 worked on T6 as R51', () => {
            assert(exists(state.data().credits, 'T6', 'P567', 'R51'));
          });

          it('P567 worked on T7 as R51', () => {
            assert(exists(state.data().credits, 'T7', 'P567', 'R51'));
          });

          it('No one worked on T8', () => {
            assert(!state.data().credits.find(credit => credit.track === 'T8'));
          });
        });

        describe('extracts comma separated multi track release credit', () => {
          it('P910 worked on T9 as R910', () => {
            assert(exists(state.data().credits, 'T9', 'P910', 'R910'));
          });

          it('P920 worked on T10 as R910', () => {
            assert(exists(state.data().credits, 'T10', 'P910', 'R910'));
          });
        });

        describe('extracts mixed range type multi track release credit', () => {
          it('P111315 worked on T11 as R111315', () => {
            assert(exists(state.data().credits, 'T11', 'P111315', 'R111315'));
          });

          it('P111315 worked on T13 as R111315', () => {
            assert(exists(state.data().credits, 'T13', 'P111315', 'R111315'));
          });

          it('P111315 worked on T14 as R111315', () => {
            assert(exists(state.data().credits, 'T14', 'P111315', 'R111315'));
          });

          it('P111315 worked on T15 as R111315', () => {
            assert(exists(state.data().credits, 'T15', 'P111315', 'R111315'));
          });

          it('No one worked on T12', () => {
            assert(!state.data().credits.find(credit => credit.track === 'T12'));
          });
        });

        it('Ignores release extra artists without role nor tracks', () => {
          assert(!state.data().credits.find(credit => credit.name === 'P16'));
        });

        it('Ignores release extra artists without tracks', () => {
          assert(!state.data().credits.find(credit => credit.name === 'P17'));
        });

        it('No one worked on track 16', () => {
          assert(!state.data().credits.find(credit => credit.track === 'T16'));
        });

        it('No one worked on track 17', () => {
          assert(!state.data().credits.find(credit => credit.track === 'T17'));
        });

        describe('extracts literal (with to) range type multi track release credit', () => {
          it('P181920 worked on T18 as R181920', () => {
            assert(exists(state.data().credits, 'T18', 'P181920', 'R181920'));
          });

          it('P181920 worked on T19 as R181920', () => {
            assert(exists(state.data().credits, 'T19', 'P181920', 'R181920'));
          });

          it('P181920 worked on T20 as R181920', () => {
            assert(exists(state.data().credits, 'T20', 'P181920', 'R181920'));
          });
        });

        // In formats that have 2 sides (cassettes, LPs) or multiple units of the same
        // format type, positions can be described using non numeric strings such as:
        // A1, A2, A3, B1, B2...
        describe('Can work with non numeric positions in release credits', () => {
          it('individually', () => {
            assert(exists(state.data().credits, 'T21', 'P21', 'R21'));
          });

          describe('in a range', () => {
            describe('literal', () => {
              it('P2223 worked on T22 as R2223', () => {
                assert(exists(state.data().credits, 'T22', 'P2223', 'R2223'));
              });

              it('P2223 worked on T23 as R2223', () => {
                assert(exists(state.data().credits, 'T23', 'P2223', 'R2223'));
              });
            });

            describe('hyphenated', () => {
              it('P2425 worked on T24 as R2425', () => {
                assert(exists(state.data().credits, 'T24', 'P2425', 'R2425'));
              });

              it('P2425 worked on T25 as R2425', () => {
                assert(exists(state.data().credits, 'T25', 'P2425', 'R2425'));
              });
            });
          });
        });

        describe('Can work with mixed multi ranges and position types', () => {
          it('P1 worked on T19 as R1', () => {
            assert(exists(state.data().credits, 'T19', 'P1', 'R1'));
          });

          it('P1 worked on T20 as R1', () => {
            assert(exists(state.data().credits, 'T20', 'P1', 'R1'));
          });

          it('P1 worked on T21 as R1', () => {
            assert(exists(state.data().credits, 'T21', 'P1', 'R1'));
          });

          it('P1 worked on T23 as R1', () => {
            assert(exists(state.data().credits, 'T23', 'P1', 'R1'));
          });

          it('P1 worked on T24 as R1', () => {
            assert(exists(state.data().credits, 'T24', 'P1', 'R1'));
          });

          it('P1 worked on T25 as R1', () => {
            assert(exists(state.data().credits, 'T25', 'P1', 'R1'));
          });
        });

        describe('Special roles', () => {
          it('Composers', () => {
            assert(exists(state.data().credits, 'T26', 'P26-1', 'Composer'));
          });

          it('Producers', () => {
            assert(exists(state.data().credits, 'T26', 'P26-2', 'Producer'));
          });

          it('Featured', () => {
            assert(exists(state.data().credits, 'T26', 'P26-3', 'Featured'));
          });
        });
      });
    });

    describe('Credit reducer', () => {
      describe('adds credits', () => {
        before(() => {
          state.addCredits(album, {
            tracklist: [{
              id: 'T1',
              extraartists: [{
                name: 'x',
                role: 'y',
              }],
            }],
          });
        });

        it('test value', () => {
          assert(state.data().credits.find(c => c.name === 'x' && c.role === 'y'));
        });
      });

      describe('avoids duplicate credits', () => {
        state.addCredits(album, {
          tracklist: [{
            id: 'T1',
            extraartists: [{ name: 'Pe1', role: 'R1' }],
          }, {
            id: 'T2',
            extraartists: [{ name: 'Pé2', role: 'R2' }],
          }, {
            id: 'T3',
            extraartists: [{ name: 'P3', role: 'R3' }],
          }, {
            id: 'T4',
            extraartists: [],
          }, {
            id: 'T5',
            extraartists: [{ name: 'Pé5', role: 'R5' }],
          }],
        });
        state.addCredits(album, {
          tracklist: [{
            id: 'T1',
            extraartists: [{ name: 'Pé1', role: 'R1' }],
          }, {
            id: 'T2',
            extraartists: [{ name: 'Pe2', role: 'R2' }],
          }, {
            id: 'T3',
            extraartists: [{ name: 'P3', role: 'R3' }],
          }, {
            id: 'T4',
            extraartists: [{ name: 'P4', role: 'R4' }, { name: 'P3', role: 'R3' }],
          }, {
            id: 'T5',
            extraartists: [{ name: 'Pé5', role: 'R5' }],
          }, {
            id: 'T6',
            extraartists: [{ name: 'Pe6', role: 'R6' }],
          }],
        });

        it('has accented Pe1', () => {
          assert(state.data().credits.find(c => c.name === 'Pé1' && c.role === 'R1' && c.track === 'T1'));
        });

        it('has NOT unaccented Pe1', () => {
          assert(!state.data().credits.find(c => c.name === 'Pe1' && c.role === 'R1' && c.track === 'T1'));
        });

        it('has accented Pe2', () => {
          assert(state.data().credits.find(c => c.name === 'Pé2' && c.role === 'R2' && c.track === 'T2'));
        });

        it('has NOT unaccented Pe2', () => {
          assert(!state.data().credits.find(c => c.name === 'Pe2' && c.role === 'R2' && c.track === 'T2'));
        });

        it('adds credits that have no equivalent accented or not', () => {
          assert(state.data().credits.find(c => c.name === 'P3' && c.role === 'R3' && c.track === 'T3'));
        });

        it('keeps credits that have no equivalent accented or not', () => {
          assert(state.data().credits.find(c => c.name === 'P4' && c.role === 'R4' && c.track === 'T4'));
        });

        it('compares credits by the role when name is the same', () => {
          assert(state.data().credits.find(c => c.name === 'P3' && c.role === 'R3' && c.track === 'T4'));
        });

        it('has only one Pé5', () => {
          assert.equal(state.data().credits.filter(c => c.name === 'Pé5' && c.role === 'R5' && c.track === 'T5').length, 1);
        });

        it('has only one Pe6', () => {
          assert.equal(state.data().credits.filter(c => c.name === 'Pe6' && c.role === 'R6' && c.track === 'T6').length, 1);
        });
      });
    });

    it('clears search', () => {
      state.clearSearch('S1');
      assert.deepEqual(state.data().searches[0], {
        id: 'S1',
        lastSearchPage: null,
        lastRelease: null,
      });
    });

    after(() => {
      state.removeSearch('S1');
      assert.equal(state.data().searches.length, 0);
    });
  });
});
