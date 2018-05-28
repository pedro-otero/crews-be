const tracks = require('./tracks');
const assert = require('assert');

const track = tracks.create('T1', 'Title');

describe('Track object', () => {
  it('has initial empty structure', () => {
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: [],
      producers: [],
      featured: [],
      credits: {},
    });
  });

  it('adds composers', () => {
    tracks(track).addCredit({
      name: 'P1',
      role: 'Written-By',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['P1'],
      producers: [],
      featured: [],
      credits: {},
    });
  });

  it('adds producers', () => {
    tracks(track).addCredit({
      name: 'P2',
      role: 'Produced By',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['P1'],
      producers: ['P2'],
      featured: [],
      credits: {},
    });
  });

  it('adds featured artists', () => {
    tracks(track).addCredit({
      name: 'P3',
      role: 'feat.',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['P1'],
      producers: ['P2'],
      featured: ['P3'],
      credits: {},
    });
  });

  it('adds other credits', () => {
    tracks(track).addCredit({
      name: 'P4',
      role: 'Piano',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['P1'],
      producers: ['P2'],
      featured: ['P3'],
      credits: { P4: ['Piano'] },
    });
  });

  it('adds other credits for existing artists', () => {
    tracks(track).addCredit({
      name: 'P4',
      role: 'Drums',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['P1'],
      producers: ['P2'],
      featured: ['P3'],
      credits: { P4: ['Piano', 'Drums'] },
    });
  });

  it('does not duplicate composers', () => {
    tracks(track).addCredit({
      name: 'P1',
      role: 'Written By',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['P1'],
      producers: ['P2'],
      featured: ['P3'],
      credits: { P4: ['Piano', 'Drums'] },
    });
  });

  it('does not duplicate producers', () => {
    tracks(track).addCredit({
      name: 'P2',
      role: 'Producer',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['P1'],
      producers: ['P2'],
      featured: ['P3'],
      credits: { P4: ['Piano', 'Drums'] },
    });
  });
});
