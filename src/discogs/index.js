"use strict";

const winston = require('winston');

const order = require('./order');
const { actions } = require('../redux/state/index');

module.exports = function (db) {
  const doCatch = e => {
    console.log(e);
    return;
  };

  this.findReleases = album => {
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console()
      ]
    });

    const msg = (album, theRest) => `${album.artists[0].name} - ${album.name} (${album.id}) :: ${theRest}`;

    const { artists: [{ name: artist }], name } = album;
    const params = {
      artist,
      release_title: name.replace(/(.+) \((.+)\)/, '$1'),
      type: 'release',
      per_page: 100,
      page: 1,
    };

    const loadAllReleases = page => {
      logger.info(msg(album, `${page.pagination.items} release results found`));
      actions.releaseResults(album.id, page);
      const results = order(page.results, album);
      results.forEach(result => {
        db.getRelease(result.id).then(release => {
          logger.info(msg(album, `Release ${release.id} (master ${release.master_id}) retrieved`));
          actions.addRelease(release);
        }).catch(doCatch);
      });
    };

    db.search(params).then(loadAllReleases).catch(doCatch);
  }
};