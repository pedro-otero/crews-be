const { actions } = require('../redux/state');
const Query = require('../redux/view/query');

const spotifyErrorMessages = require('./spotify-errors');

const observer = (logger, transaction) => ({
  next: ({ type, data: { page, release } }) => ({
    results: () => {
      logger.results({ page });
      transaction.addResults(page);
    },
    release: () => {
      logger.release({ release });
      transaction.addRelease(release);
    },
  })[type](),
  error: (error) => {
    logger.error(error);
    transaction.putError(error);
    transaction.clear();
  },
  complete: logger.finish.bind(logger, {}),
});

const storeTransaction = (id) => {
  let album;
  const pages = [];
  const addSearch = () => actions.addSearch(id);
  const addAlbum = (searchAlbum) => {
    album = searchAlbum;
    actions.addAlbum(album);
  };
  const addResults = (page) => {
    actions.releaseResults(album.id, page);
    pages.push(page);
  };
  const addRelease = release => actions.addRelease(release);
  const putError = error => actions.putError(id, error);
  const abort = () => actions.removeSearch(id);
  const clear = () => {
    const releases = pages
      .reduce((result, page) => result.concat(page.results.map(r => r.id)), []);
    actions.removeReleases(releases);
    actions.removeResults(id);
  }
  return {
    addSearch, addAlbum, addResults, addRelease, putError, abort, clear,
  };
};

module.exports = (spotify, discogs, store, createLogger) => (id) => {
  const search = store.getState().searches.find(item => item.id === id);

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

  const start = () => new Promise((resolve, reject) => {
    const transaction = storeTransaction(id);
    if (search) {
      const query = Query(id, store);
      resolve(response(query));
      return;
    }
    spotify
      .then((api) => {
        transaction.addSearch(id);
        return api.getAlbum(id);
      }, () => reject(Error(spotifyErrorMessages.login)))
      .then(({ body }) => {
        resolve(response());
        const album = body;
        transaction.addAlbum(album);
        const logger = createLogger(album);
        discogs.findReleases(album).subscribe(observer(logger, transaction));
      }, (reason) => {
        reject(albumRejection(reason));
        transaction.abort();
      }).catch(reject);
  });

  return { start };
};
