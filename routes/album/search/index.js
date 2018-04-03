"use strict";

const match = require('./filters');
const { actions } = require('../state');

module.exports = function (db) {

  const find = (album, type) => {
    const { id, artists, name } = album;
    actions.setStatus(id, `FINDING ${type.toUpperCase()}`);
    let page = 1;
    return db.search({
      artist: artists[0].name,
      release_title: name.replace(/(.+) \((.+)\)/, '$1'),
      type,
      per_page: 100,
      page,
    }).then(({ results }) => {
      ({
        'master': () => actions.masterResults(id, results),
        'release': () => actions.releaseResults(id, results),
      })[type]();
      return results;
    })
      .then(match(album).by('title', 'exact title', 'format', 'year'))
      .then(filtered => filtered.map(result => result.id));
  };

  const get = func => ids => Promise.all(ids.map(id => func(id)));

  this.findMasters = album => find(album, 'master').then(get(db.getMaster));

  this.findReleases = album => find(album, 'master')
    .then(masters => {
      return get(db.getMasterVersions)(masters);
    })
    .then(masterVersions => {
      return match(album).by('year')(masterVersions);
    })
    .then(filtered => filtered.reduce((allVersions, currentMaster) => allVersions.concat(currentMaster.versions), []))
    .then(allVersions => allVersions.map(version => version.id))
    .then(releaseIds => releaseIds.length ? releaseIds : find(album, 'release'))
    .then(releaseIds => {
      releaseIds
        .map(db.getRelease)
        .forEach(promise => {
          promise.then(actions.addRelease);
        });
    });
}