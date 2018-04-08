const winston = require('winston');

const order = require('./order');
const { actions } = require('../redux/state/index');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = function (db) {
  const doCatch = (e) => {
    logger.error(e);
  };

  this.findReleases = (album) => {
    const msg = text => `${album.artists[0].name} - ${album.name} (${album.id}) :: ${text}`;

    const fetch = async (params) => {
      const page = await db.search(params);
      logger.info(msg(album, `${page.pagination.page}/${page.pagination.pages} page with ${page.results.length} release results found`));
      actions.releaseResults(album.id, page);
      const results = order(page.results, album);
      results.forEach(async (result, i) => {
        const release = await db.getRelease(result.id);
        logger.info(msg(album, `P(${page.pagination.page}/${page.pagination.pages}) R(${(i + 1)}/${results.length}) Release ${release.id} (master ${release.master_id}) retrieved`));
        actions.addRelease(release);
        if (i === page.results.length - 1 && page.pagination.page < page.pagination.pages) {
          fetch(Object.assign(params, { page: page.pagination.page + 1 }));
        }
      });
    };

    const { artists: [{ name: artist }], name } = album;
    const params = {
      artist,
      release_title: name.replace(/(.+) \((.+)\)/, '$1'),
      type: 'release',
      per_page: 100,
      page: 1,
    };

    fetch(params);
  };
};
