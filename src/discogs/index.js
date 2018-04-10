const order = require('./order');
const { actions } = require('../redux/state/index');

const createLogger = require('./logger');

const makeParams = (artist, title) => ({
  artist,
  release_title: title.replace(/(.+) \((.+)\)/, '$1'),
  type: 'release',
  per_page: 100,
  page: 1,
});

module.exports = function (db) {
  this.findReleases = (album) => {
    const logger = createLogger(album);

    async function getAllReleases(page) {
      const results = order(page.results, album);
      let i = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const result of results) {
        // eslint-disable-next-line no-await-in-loop
        const release = await db.getRelease(result.id);
        logger.release({
          page, release, i,
        });
        i += 1;
        actions.addRelease(release);
      }
    }

    const fetch = async (params) => {
      const page = await db.search(params);
      logger.results({ page });
      actions.releaseResults(album.id, page);
      await getAllReleases(page);
      if (page.pagination.page < page.pagination.pages) {
        fetch(Object.assign(params, { page: page.pagination.page + 1 }));
      } else {
        logger.finish({});
      }
    };

    const { artists: [{ name: artist }], name } = album;
    fetch(makeParams(artist, name));
  };
};
