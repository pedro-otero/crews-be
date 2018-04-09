const order = require('./order');
const { actions } = require('../redux/state/index');

const logger = require('./logger');

const makeParams = (artist, title) => ({
  artist,
  release_title: title.replace(/(.+) \((.+)\)/, '$1'),
  type: 'release',
  per_page: 100,
  page: 1,
});

module.exports = function (db) {
  this.findReleases = (album) => {
    const fetch = async (params) => {
      const page = await db.search(params);
      logger.results({ album, page });
      actions.releaseResults(album.id, page);
      const results = order(page.results, album);
      results.forEach(async (result, i) => {
        const release = await db.getRelease(result.id);
        logger.release({
          album, page, release, i,
        });
        actions.addRelease(release);
      });
      if (page.pagination.page < page.pagination.pages) {
        fetch(Object.assign(params, { page: page.pagination.page + 1 }));
      }
    };

    const { artists: [{ name: artist }], name } = album;
    fetch(makeParams(artist, name));
  };
};
