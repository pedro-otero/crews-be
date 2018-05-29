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
    thisValue.id === trackId && args.name === name && args.role === role);

describe('Album module', () => {
  it('creates albums', () => {
    assert.deepEqual(album, expectedAlbum);
  });

  it('splits credits from a release', () => {
    album.merge(mockRelease);
    assert.deepEqual(addCreditsSpy.getCalls().length, 32);
  });

  it('has P3 as having worked as R3 for T3', () => {
    album.merge(mockRelease);
    assert(exists('T3', 'P3', 'R3'));
  });

  it('has P4 as having worked as R41 for T3', () => {
    album.merge(mockRelease);
    assert(exists('T4', 'P4', 'R41'));
  });

  it('has P4 as having worked as R42 for T3', () => {
    album.merge(mockRelease);
    assert(exists('T4', 'P4', 'R42'));
  });

  it('has P567 as having worked as R51 for T5', () => {
    album.merge(mockRelease);
    assert(exists('T5', 'P567', 'R51'));
  });

  it('has P567 as having worked as R51 for T6', () => {
    album.merge(mockRelease);
    assert(exists('T6', 'P567', 'R51'));
  });

  it('has P567 as having worked as R51 for T7', () => {
    album.merge(mockRelease);
    assert(exists('T7', 'P567', 'R51'));
  });

  it('has P910 as having worked as R910 for T9', () => {
    album.merge(mockRelease);
    assert(exists('T9', 'P910', 'R910'));
  });

  it('has P910 as having worked as R910 for T10', () => {
    album.merge(mockRelease);
    assert(exists('T10', 'P910', 'R910'));
  });

  it('has P111315 as having worked as R111315 for T11', () => {
    album.merge(mockRelease);
    assert(exists('T11', 'P111315', 'R111315'));
  });

  it('has P111315 as having worked as R111315 for T13', () => {
    album.merge(mockRelease);
    assert(exists('T13', 'P111315', 'R111315'));
  });

  it('has P111315 as having worked as R111315 for T14', () => {
    album.merge(mockRelease);
    assert(exists('T14', 'P111315', 'R111315'));
  });

  it('has P111315 as having worked as R111315 for T15', () => {
    album.merge(mockRelease);
    assert(exists('T15', 'P111315', 'R111315'));
  });

  it('has P181920 as having worked as R181920 for T18', () => {
    album.merge(mockRelease);
    assert(exists('T18', 'P181920', 'R181920'));
  });

  it('has P181920 as having worked as R181920 for T19', () => {
    album.merge(mockRelease);
    assert(exists('T19', 'P181920', 'R181920'));
  });

  it('has P181920 as having worked as R181920 for T20', () => {
    album.merge(mockRelease);
    assert(exists('T20', 'P181920', 'R181920'));
  });

  it('has P21 as having worked as R21 for T21', () => {
    album.merge(mockRelease);
    assert(exists('T21', 'P21', 'R21'));
  });

  it('has P2223 as having worked as R2223 for T22', () => {
    album.merge(mockRelease);
    assert(exists('T22', 'P2223', 'R2223'));
  });

  it('has P2223 as having worked as R2223 for T23', () => {
    album.merge(mockRelease);
    assert(exists('T23', 'P2223', 'R2223'));
  });

  it('has P2425 as having worked as R2425 for T24', () => {
    album.merge(mockRelease);
    assert(exists('T24', 'P2425', 'R2425'));
  });

  it('has P2425 as having worked as R2425 for T25', () => {
    album.merge(mockRelease);
    assert(exists('T25', 'P2425', 'R2425'));
  });

  it('has P1 as having worked as R1 for T19', () => {
    album.merge(mockRelease);
    assert(exists('T19', 'P1', 'R1'));
  });

  it('has P1 as having worked as R1 for T20', () => {
    album.merge(mockRelease);
    assert(exists('T20', 'P1', 'R1'));
  });

  it('has P1 as having worked as R1 for T21', () => {
    album.merge(mockRelease);
    assert(exists('T21', 'P1', 'R1'));
  });

  it('has P1 as having worked as R1 for T23', () => {
    album.merge(mockRelease);
    assert(exists('T23', 'P1', 'R1'));
  });

  it('has P1 as having worked as R1 for T24', () => {
    album.merge(mockRelease);
    assert(exists('T24', 'P1', 'R1'));
  });

  it('has P1 as having worked as R1 for T25', () => {
    album.merge(mockRelease);
    assert(exists('T25', 'P1', 'R1'));
  });

  it('has P1 as having worked as R1 for T1', () => {
    album.merge(mockRelease);
    assert(exists('T1', 'P1', 'R1'));
  });

  it('has P2 as having worked as R21 for T2', () => {
    album.merge(mockRelease);
    assert(exists('T2', 'P2', 'R21'));
  });

  it('has P2 as having worked as R22 for T2', () => {
    album.merge(mockRelease);
    assert(exists('T2', 'P2', 'R22'));
  });

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
