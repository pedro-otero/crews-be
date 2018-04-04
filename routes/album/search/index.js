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
      const first = match(album).by('title', 'exact title', 'format', 'year')(results);
      const second = results.filter(result => !first.find(f => f.id === result.id));
      const ordered = first.concat(second);
      return ordered;
    });
  };

  this.findReleases = album => {
    return find(album, 'master')
      .then(masters => {
        if (masters.length) {
          masters.forEach(master => {
            db.getMasterVersions(master.id).then(result => {
              result.versions.forEach(version => {
                db.getRelease(version.id).then(actions.addRelease);
              });
            });
          });
        } else {
          find(album, 'release').then(results => {
            results.forEach(result => {
              db.getRelease(result.id).then(actions.addRelease);
            })
          });
        }
      });
  }
};