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
      name: 'Pe1',
      role: 'Written-By',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pe1'],
      producers: [],
      featured: [],
      credits: {},
    });
  });

  it('adds producers', () => {
    tracks(track).addCredit({
      name: 'Pe2',
      role: 'Produced By',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pe1'],
      producers: ['Pe2'],
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
      composers: ['Pe1'],
      producers: ['Pe2'],
      featured: ['P3'],
      credits: {},
    });
  });

  it('adds other credits', () => {
    tracks(track).addCredit({
      name: 'Pe4',
      role: 'Piano',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pe1'],
      producers: ['Pe2'],
      featured: ['P3'],
      credits: { Pe4: ['Piano'] },
    });
  });

  it('adds other credits for existing artists', () => {
    tracks(track).addCredit({
      name: 'Pe4',
      role: 'Drums',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pe1'],
      producers: ['Pe2'],
      featured: ['P3'],
      credits: { Pe4: ['Piano', 'Drums'] },
    });
  });

  it('does not duplicate composers', () => {
    tracks(track).addCredit({
      name: 'Pe1',
      role: 'Written By',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pe1'],
      producers: ['Pe2'],
      featured: ['P3'],
      credits: { Pe4: ['Piano', 'Drums'] },
    });
  });

  it('does not duplicate producers', () => {
    tracks(track).addCredit({
      name: 'Pe2',
      role: 'Producer',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pe1'],
      producers: ['Pe2'],
      featured: ['P3'],
      credits: { Pe4: ['Piano', 'Drums'] },
    });
  });

  it('does not duplicate featured artists', () => {
    tracks(track).addCredit({
      name: 'P3',
      role: 'Featuring',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pe1'],
      producers: ['Pe2'],
      featured: ['P3'],
      credits: { Pe4: ['Piano', 'Drums'] },
    });
  });

  it('replaces an existing unaccented composer for its accented variant', () => {
    tracks(track).addCredit({
      name: 'Pé1',
      role: 'Composed By',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pé1'],
      producers: ['Pe2'],
      featured: ['P3'],
      credits: { Pe4: ['Piano', 'Drums'] },
    });
  });

  it('replaces an existing unaccented producer for its accented variant', () => {
    tracks(track).addCredit({
      name: 'Pé2',
      role: 'Producer',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pé1'],
      producers: ['Pé2'],
      featured: ['P3'],
      credits: { Pe4: ['Piano', 'Drums'] },
    });
  });

  it('does not replace an existing accented producer for its unaccented variant', () => {
    tracks(track).addCredit({
      name: 'Pe2',
      role: 'Producer',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pé1'],
      producers: ['Pé2'],
      featured: ['P3'],
      credits: { Pe4: ['Piano', 'Drums'] },
    });
  });

  it('replaces an existing unaccented credit name for its accented variant, leaving credits list intact', () => {
    tracks(track).addCredit({
      name: 'Pé4',
      role: 'Piano',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pé1'],
      producers: ['Pé2'],
      featured: ['P3'],
      credits: { Pé4: ['Piano', 'Drums'] },
    });
  });

  it('replaces an existing unaccented credit name for its accented variant, adding new roles to it', () => {
    tracks(track).addCredit({
      name: 'Pe5',
      role: 'Something',
    });
    tracks(track).addCredit({
      name: 'Pé5',
      role: 'else',
    });
    assert.deepEqual(track, {
      name: 'Title',
      id: 'T1',
      composers: ['Pé1'],
      producers: ['Pé2'],
      featured: ['P3'],
      credits: {
        Pé4: ['Piano', 'Drums'],
        Pé5: ['Something', 'else'],
      },
    });
  });
});
