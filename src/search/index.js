const { actions } = require('../redux/state');
const Query = require('../redux/view/query');
const createLogger = require('../discogs/logger');

module.exports = (spotify, discogs, store) => (id) => {
  const search = store.getState().searches.find(item => item.id === id);

  if (search) {
    const query = Query(id, store);
    return {
      id,
      progress: query.getProgress(),
      bestMatch: query.getBestMatch(),
    };
  }
  spotify
    .then((api) => {
      actions.addSearch(id);
      return api.getAlbum(id);
    })
    .then(({ body: album }) => {
      const logger = createLogger(album);
      actions.addAlbum(album);
      let page;
      discogs.findReleases(album)
        .subscribe(
          ({ type, data }) => {
            switch (type) {
              case 'results':
                page = data;
                logger.results({ page });
                actions.releaseResults(album.id, data);
                break;
              case 'release':
                logger.release({
                  page, release: data.release, i: data.i,
                });
                actions.addRelease(data.release);
                break;
              default:
                throw Error('This should not happen');
            }
          },
          (err) => { throw Error(err); },
          () => logger.finish({})
        );
    });
  return {
    id,
    progress: 0,
    bestMatch: null,
  };
};
