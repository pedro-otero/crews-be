const order = require('./order');
const { actions } = require('../redux/state/index');

const logger = require('./logger');

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
      logger.results({ album, page });
      actions.releaseResults(album.id, page);
      const results = order(page.results, album);
      results.forEach((result, i) => {
        db.getRelease(result.id).then((release) => {
          logger.release({
            album, page, release, i,
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
