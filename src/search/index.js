const { actions } = require('../redux/state');
const Query = require('../redux/view/query');

const spotifyErrorMessages = require('./spotify-errors');

module.exports = (spotify, discogs, store, createLogger) => (id) => {
  const search = store.getState().searches.find(item => item.id === id);
  let album;
  let logger;

  const storeTransaction = (() => {
    let _album;
    const addSearch = searchId => actions.addSearch(searchId);
    const addAlbum = (searchAlbum) => {
      _album = searchAlbum;
      actions.addAlbum(_album);
    }
    const addResults = page => actions.releaseResults(_album.id, page);
    const addRelease = release => actions.addRelease(release);
    return {
      addSearch, addAlbum, addResults, addRelease,
    };
  })();

  function response(query) {
    let progress = 0;
    let bestMatch = null;
    if (query) {
      progress = query.getProgress();
      bestMatch = query.getBestMatch();
    }
    return { id, progress, bestMatch };
  }

  const albumRejection = (reason) => {
    const code = String(reason.error.status);
    if (code in spotifyErrorMessages.http) {
      return Error(spotifyErrorMessages.http[code]);
    }
    return Error(spotifyErrorMessages.general);
  };

  const next = ({ type, data: { page, release } }) => ({
    results: () => {
      logger.results({ page });
      storeTransaction.addResults(page);
    },
    release: () => {
      logger.release({ release });
      storeTransaction.addRelease(release);
    },
  })[type]();

  const findReleases = () => {
    const { error } = logger;
    const complete = logger.finish.bind(logger, {});
    discogs.findReleases(album).subscribe({ next, error, complete });
  };

  const getAlbum = (api) => {
    storeTransaction.addSearch(id);
    return api.getAlbum(id);
  };

  const start = () => new Promise((resolve, reject) => {
    if (search) {
      const query = Query(id, store);
      resolve(response(query));
      return;
    }
    spotify
      .then(getAlbum, () => reject(Error(spotifyErrorMessages.login)))
      .then(({ body }) => {
        resolve(response());
        album = body;
        storeTransaction.addAlbum();
        logger = createLogger(album);
        findReleases();
      }, reason => reject(albumRejection(reason))).catch(reject);
  });

  return { start };
};
