const { actions } = require('../redux/state');

const spotifyErrorMessages = require('./spotify-errors');
const createMessagesFactory = require('./messages');

const {
  isTimeout,
  is429, sleep,
  isThereNext,
} = require('./utils');

module.exports = (spotify, discogs, createLogger) => (id) => {
  let album;
  let currentTask;
  const tasks = [];
  let logger;
  let lastPage;
  let tag;
  let messages;

  const results = (page) => {
    tasks.push(...page.results.map((_, data) => ({ type: 'release', data })));
    if (isThereNext(page)) {
      tasks.push({ type: 'search', data: page.pagination.page + 1 });
    }
    logger.info(messages.resultsMsg(page));
    actions.setLastSearchPage(album.id, page);
    lastPage = page;
  };

  const sendRelease = (release) => {
    logger.info(messages.releaseMsg(release, currentTask.data + 1, lastPage));
    actions.setLastRelease(album.id, release);
    if (release.tracklist.length === album.tracks.items.length) {
      actions.addCredits(album, release);
    } else {
      logger.debug(messages.albumMismatch(release, album));
    }
  };

  const logTimeout = () => {
    if (currentTask.type === 'search') {
      logger.error(messages.searchPageTimeout(currentTask.data));
    } else {
      const number = currentTask.data + 1;
      const releaseId = lastPage.results[currentTask.data].id;
      logger.error(messages.releaseTimeout(releaseId, number, lastPage.results.length));
    }
  };

  const logError = (error) => {
    logger.error(messages.exception(error));
    actions.clearSearch(id);
  };

  const albumRejection = (reason) => {
    const code = String(reason.statusCode);
    if (code in spotifyErrorMessages.http) {
      return Error(spotifyErrorMessages.http[code]);
    }
    return Error(spotifyErrorMessages.general);
  };

  const run = ({ type, data }) => ({
    search: page => discogs.db.search({
      artist: album.artists[0].name,
      release_title: album.name.replace(/(.+) \((.+)\)/, '$1'),
      type: 'release',
      per_page: 100,
      page,
    }),
    release: index => discogs.db.getRelease(lastPage.results[index].id),
    wait: time => sleep(time),
  })[type](data);

  const makeItWait = () => tasks.unshift({
    type: 'wait',
    data: discogs.PAUSE_NEEDED_AFTER_429,
  });

  const complete = ({ type }) => ({
    search: results,
    release: sendRelease,
    wait: () => {},
  })[type];

  const performTask = () => {
    currentTask = tasks.shift();
    try {
      run(currentTask).then(complete(currentTask), (error) => {
        if (isTimeout(error)) {
          logTimeout();
          tasks.unshift(currentTask);
        } else if (is429(error)) {
          logger.error(messages.tooManyRequests(discogs.PAUSE_NEEDED_AFTER_429));
          tasks.unshift(currentTask);
          makeItWait();
        } else {
          throw error;
        }
      }).catch((error) => {
        actions.removeSearch(id);
        logError(error);
        tasks.splice(0, tasks.length);
      }).then(() => {
        if (tasks.length) {
          performTask();
        } else {
          logger.info(messages.finish());
        }
      });
    } catch (error) {
      logError(error);
    }
  };

  const start = () => new Promise((resolve, reject) => {
    spotify.getApi()
      .then((api) => {
        actions.addSearch(id);
        return api.getAlbum(id);
      }, () => reject(Error(spotifyErrorMessages.login)))
      .then(({ body }) => {
        album = body;
        actions.addAlbum(album);
        logger = createLogger(album);
        tag = `${new Date().toLocaleString()} ${album.artists[0].name} - ${album.name} (${album.id}) ::`;
        messages = createMessagesFactory(tag);
        tasks.push({ type: 'search', data: 1 });
        performTask();
        resolve({ id, progress: 0, bestMatch: null });
      }, (reason) => {
        reject(albumRejection(reason));
        actions.removeSearch(id);
      }).catch(reject);
  });

  return { start };
};
