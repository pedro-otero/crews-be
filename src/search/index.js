"use strict";

const order = require('./order');
const { actions } = require('../redux/state/index');

module.exports = function (db) {

  this.findReleases = album => {
    const { artists: [{ name: artist }], name } = album;
    return db.search({
      artist,
      release_title: name.replace(/(.+) \((.+)\)/, '$1'),
      type: 'release',
      per_page: 100,
      page: 1,
    }).then(page => {
      actions.releaseResults(album.id, page);
      const results = order(page.results, album);
      results.forEach(result => {
        db.getRelease(result.id).then(actions.addRelease);
      })
    });
  }
};