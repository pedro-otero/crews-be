"use strict";

const order = require('./order');
const { actions } = require('../redux/state/index');

module.exports = function (db) {

  const params = ({ artists: [{ name: artist }], name }, type, page = 1) => ({
    artist,
    release_title: name.replace(/(.+) \((.+)\)/, '$1'),
    type,
    per_page: 100,
    page,
  });

  const find = (album, type) => {
    return db.search(params(album, type)).then(page => {
      ({
        'master': () => actions.masterResults(album.id, page),
        'release': () => actions.releaseResults(album.id, page),
      })[type]();
      return order(page.results, album);
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