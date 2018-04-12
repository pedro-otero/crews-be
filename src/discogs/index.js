const order = require('./order');
const { actions } = require('../redux/state/index');

const createLogger = require('./logger');

module.exports = function (db) {
  const search = async ({
    name,
    artists: [{
      name: artist,
    }],
  }, page) => db.search({
    artist,
    release_title: name.replace(/(.+) \((.+)\)/, '$1'),
    type: 'release',
    per_page: 100,
    page,
  });

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

    const fetch = async (p) => {
      const page = await search(album, p);
      logger.results({ page });
      actions.releaseResults(album.id, page);
      await getAllReleases(page);
      if (page.pagination.page < page.pagination.pages) {
        fetch(page.pagination.page + 1);
      } else {
        logger.finish({});
      }
    };

    fetch(1);
  };
};
