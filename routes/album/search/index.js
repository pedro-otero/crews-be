"use strict";

const match = require('./filters');
const store = require('../state');
const actions = require('../state/actions');

module.exports = function (db) {

  const find = (album, type) => {
    store.dispatch(actions.setStatus(album.id, `FINDING ${type.toUpperCase()}`));
    return db.search({
      artist: album.artists[0].name,
      release_title: album.name.replace(/(.+) \((.+)\)/, '$1'),
      type
    }).then(search => search.results)
      .then(match(album).by('title', 'exact title', 'format', 'year'))
      .then(filtered => filtered.map(result => result.id));
  };

  const get = func => ids => Promise.all(ids.map(id => func(id)));

  this.findMasters = album => find(album, 'master').then(get(db.getMaster));

  this.findReleases = album => find(album, 'master')
    .then(get(db.getMasterVersions))
    .then(match(album).by('year'))
    .then(filtered => filtered.reduce((allVersions, currentMaster) => allVersions.concat(currentMaster.versions), []))
    .then(allVersions => allVersions.map(version => version.id))
    .then(releaseIds => releaseIds.length ? releaseIds : find(album, 'release'))
    .then(get(db.getRelease))
    .then(match(album).by('tracklist', 'release date'));
}