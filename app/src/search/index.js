const { actions } = require('../redux/state');

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
  const abort = () => actions.removeSearch(id);
  const clear = () => {
    const releases = pages
      .reduce((result, page) => result.concat(page.results.map(r => r.id)), []);
    actions.removeReleases(releases);
    actions.removeResults(id);
  };
  return {
    addSearch, addAlbum, addResults, addRelease, abort, clear,
  };
};

module.exports = (spotify, discogs, createLogger) => (id) => {
  const albumRejection = (reason) => {
    const code = String(reason.error.status);
    if (code in spotifyErrorMessages.http) {
      return Error(spotifyErrorMessages.http[code]);
    }
    return Error(spotifyErrorMessages.general);
  };

  const start = () => new Promise((resolve, reject) => {
    const transaction = storeTransaction(id);
    spotify.getApi()
      .then((api) => {
        transaction.addSearch(id);
        return api.getAlbum(id);
      }, () => reject(Error(spotifyErrorMessages.login)))
      .then(({ body }) => {
        resolve({ id, progress: 0, bestMatch: null });
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
