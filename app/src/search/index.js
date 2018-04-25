const { actions } = require('../redux/state');

const spotifyErrorMessages = require('./spotify-errors');

const observer = (logger, output) => ({
  results: (page) => {
    logger.results({ page });
    output.setLastSearchResults(page);
  },
  release: (release) => {
    logger.release({ release });
    output.sendRelease(release);
  },
  timeout: (error) => {
    logger.error({ error });
  },
  error: (error) => {
    logger.error({ error });
    output.clear();
  },
  complete: logger.finish.bind(logger, {}),
});

const actionsWrapper = (id) => {
  let album;
  const pages = [];
  const addSearch = () => actions.addSearch(id);
  const addAlbum = (searchAlbum) => {
    album = searchAlbum;
    actions.addAlbum(album);
  };
  const setLastSearchResults = (page) => {
    actions.setLastSearchPage(album.id, page);
    pages.push(page);
  };
  const sendRelease = (release) => {
    if (release.tracklist.length === album.tracks.items.length) {
      actions.addCredits(album, release);
      actions.setLastRelease(album.id, release);
    }
  };
  const abort = () => actions.removeSearch(id);
  const clear = () => actions.clearSearch(id);
  return {
    addSearch, addAlbum, setLastSearchResults, sendRelease, abort, clear,
  };
};

module.exports = (spotify, db, createLogger) => (id) => {
  const albumRejection = (reason) => {
    const code = String(reason.statusCode);
    if (code in spotifyErrorMessages.http) {
      return Error(spotifyErrorMessages.http[code]);
    }
    return Error(spotifyErrorMessages.general);
  };

  const search = (album, page) => db.search({
    artist: album.artists[0].name,
    release_title: album.name.replace(/(.+) \((.+)\)/, '$1'),
    type: 'release',
    per_page: 100,
    page,
  });

  const findReleases = (album, searchObserver) => {
    let p = 1;
    const fetch = async () => {
      try {
        search(album, p).then(async (page) => {
          searchObserver.results(page);
          // eslint-disable-next-line no-restricted-syntax
          for (const result of page.results) {
            try {
              // eslint-disable-next-line no-await-in-loop
              const release = await db.getRelease(result.id);
              searchObserver.release(release);
            } catch (error) {
              searchObserver.error(error);
              return;
            }
          }
          if (page.pagination.page < page.pagination.pages) {
            p = page.pagination.page + 1;
            fetch();
          } else {
            searchObserver.complete();
          }
        }, (error) => {
          if (error.code === 'ETIMEDOUT' && error.errno === 'ETIMEDOUT') {
            searchObserver.timeout(error);
            fetch();
          } else {
            searchObserver.error(error);
          }
        }).catch((error) => {
          searchObserver.error(error);
        });
      } catch (error) {
        searchObserver.error(error);
      }
    };

    fetch();
  };

  const start = () => new Promise((resolve, reject) => {
    const output = actionsWrapper(id);
    spotify.getApi()
      .then((api) => {
        output.addSearch(id);
        return api.getAlbum(id);
      }, () => reject(Error(spotifyErrorMessages.login)))
      .then(({ body }) => {
        const album = body;
        output.addAlbum(album);
        const logger = createLogger(album);
        findReleases(album, observer(logger, output));
        resolve({ id, progress: 0, bestMatch: null });
      }, (reason) => {
        reject(albumRejection(reason));
        output.abort();
      }).catch(reject);
  });

  return { start };
};
