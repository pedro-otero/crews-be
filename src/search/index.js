const { actions } = require('../redux/state');
const Query = require('../redux/view/query');
const createLogger = require('./logger');

module.exports = (spotify, discogs, store) => id => new Promise((resolve, reject) => {
  const search = store.getState().searches.find(item => item.id === id);

  if (search) {
    const query = Query(id, store);
    resolve({
      id,
      progress: query.getProgress(),
      bestMatch: query.getBestMatch(),
    });
    return;
  }
  spotify
    .then((api) => {
      actions.addSearch(id);
      return api.getAlbum(id);
    }).then(({ body: album }) => {
      resolve({
        id,
        progress: 0,
        bestMatch: null,
      });
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
    }, (reason) => {
      if (reason.error.status === 404) {
        reject(Error('Album does not exist in Spotify'));
      }
    }).catch(reject);
});
