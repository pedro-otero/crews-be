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
});
