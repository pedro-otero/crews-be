const { actions } = require('../redux/state');
const Query = require('../redux/view/query');

const spotifyErrorMessages = {
  400: 'Spotify album id is invalid',
  404: 'Album does not exist in Spotify',
};

module.exports = (spotify, discogs, store, createLogger) => (id) => {
  const search = store.getState().searches.find(item => item.id === id);
  let album;
  let logger;

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
    if (reason.error.status in spotifyErrorMessages) {
      return Error(spotifyErrorMessages[reason.error.status]);
    }
    return Error("There's something wrong with Spotify");
  };

  const onNext = ({ type, data }) => {
    switch (type) {
      case 'results':
        logger.results({ page: data });
        actions.releaseResults(album.id, data);
        break;
      case 'release':
        logger.release({
          release: data.release, i: data.i,
        });
        actions.addRelease(data.release);
        break;
      default:
        throw Error('This should not happen');
    }
  };

  const findReleases = () => discogs
    .findReleases(album)
    .subscribe({
      next: onNext,
      error: logger.error,
      complete: logger.finish.bind(logger, {}),
    });

  const getAlbum = (api) => {
    actions.addSearch(id);
    return api.getAlbum(id);
  };

  const failSpotifyLogin = () => Error("Server couldn't login to Spotify");

  const start = () => new Promise((resolve, reject) => {
    if (search) {
      const query = Query(id, store);
      resolve(response(query));
      return;
    }
    spotify
      .then(getAlbum, () => reject(failSpotifyLogin()))
      .then(({ body }) => {
        resolve(response());
        album = body;
        actions.addAlbum(album);
        logger = createLogger(album);
        findReleases();
      }, reason => reject(albumRejection(reason))).catch(reject);
  });

  return { start };
};
