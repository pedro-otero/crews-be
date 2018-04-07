"use strict";

const winston = require('winston');

const order = require('./order');
const { actions } = require('../redux/state/index');

module.exports = function (db) {

  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console()
    ]
  });

  const params = ({ artists: [{ name: artist }], name }, type, page = 1) => ({
    artist,
    release_title: name.replace(/(.+) \((.+)\)/, '$1'),
    type,
    per_page: 100,
    page,
  });

  const msg = (album, theRest) => `${album.artists[0].name} - ${album.name} (${album.id}) :: ${theRest}`;

  const find = (album, type) => {
    return db.search(params(album, type)).then(page => {
      ({
        'master': () => actions.masterResults(album.id, page),
        'release': () => actions.releaseResults(album.id, page),
      })[type]();
      logger.info(msg(album, `${page.pagination.items} ${type} results found`));
      return order(page.results, album);
    });
  };

  this.findReleases = album => {
    return find(album, 'master')
      .then(masters => {
        if (masters.length) {
          masters.forEach(master => {
            db.getMasterVersions(master.id).then(result => {
              logger.info(msg(album, `${result.pagination.items} versions of master ${master.id} found`));
              result.versions.forEach(version => {
                db.getRelease(version.id).then(release => {
                  logger.info(msg(album, `Version ${release.id} of master ${release.master_id} retrieved`));
                  actions.addRelease(release);
                });
              });
            });
          });
        } else {
          find(album, 'release').then(results => {
            results.forEach(result => {
              db.getRelease(result.id).then(release => {
                logger.info(msg(album, `Release ${release.id} (master ${release.master_id}) retrieved`));
                actions.addRelease(release);
              });
            })
          });
        }
      });
  }
};