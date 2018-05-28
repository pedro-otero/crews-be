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
});
