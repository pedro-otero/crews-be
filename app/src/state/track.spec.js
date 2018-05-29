const Track = require('./track');
const assert = require('assert');

const track = new Track('T1', 'Title');

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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
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
    track.addCredit({
      name: 'Pe5',
      role: 'Something',
    });
    track.addCredit({
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

  it('adds credits to unaccented names', () => {
    track.addCredit({
      name: 'P6',
      role: 'Other',
    });
    track.addCredit({
      name: 'P6',
      role: 'thing',
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
        P6: ['Other', 'thing'],
      },
    });
  });

  it('does not duplicate credits for a collaborator', () => {
    track.addCredit({
      name: 'P6',
      role: 'thing',
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
        P6: ['Other', 'thing'],
      },
    });
  });
});
