const winston = require('winston');

const order = require('./order');
const { actions } = require('../redux/state/index');

const { printf, combine } = winston.format;
const logger = winston.createLogger({
  levels: {
    finish: 0,
    results: 1,
    release: 2,
    error: 3,
  },
  format: combine(printf((info) => {
    switch (info.level) {
      case 'finish':
        return info.message;
      case 'results':
        return info.message;
      case 'release':
        return `${info.message.album.artists[0].name} - ${info.message.album.name} (${info.message.album.id}) :: P(${info.message.page.pagination.page}/${info.message.page.pagination.pages}) R(${(info.message.i + 1)}/${info.message.page.results.length}) Release ${info.message.release.id} (master ${info.message.release.master_id}) retrieved`;
      default:
        return info.message;
    }
  })),
  transports: [
    new winston.transports.Console({ level: 'finish' }),
    new winston.transports.Console({ level: 'results' }),
    new winston.transports.Console({ level: 'release' }),
    new winston.transports.Console({ level: 'error' }),
  ],
});

module.exports = function (db) {
  const doCatch = (e) => {
    logger.error(e);
  };

  this.findReleases = (album) => {
    const msg = text => `${album.artists[0].name} - ${album.name} (${album.id}) :: ${text}`;

    const { artists: [{ name: artist }], name } = album;
    const params = {
      artist,
      release_title: name.replace(/(.+) \((.+)\)/, '$1'),
      type: 'release',
      per_page: 100,
      page: 1,
    };

    const loadAllReleases = (page) => {
      logger.results(msg(album, `${page.pagination.page}/${page.pagination.pages} page with ${page.results.length} release results found`));
      actions.releaseResults(album.id, page);
      const results = order(page.results, album);
      results.forEach((result, i) => {
        db.getRelease(result.id).then((release) => {
          logger.release({
            album,
            page,
            release,
            i,
          });
          actions.addRelease(release);
          if (i === page.results.length - 1 && page.pagination.page < page.pagination.pages) {
            Object.assign(params, { page: page.pagination.page + 1 });
            db.search(params).then(loadAllReleases).catch(doCatch);
          }
        }).catch(doCatch);
      });
    };

    db.search(params).then(loadAllReleases).catch(doCatch);
  };
};
