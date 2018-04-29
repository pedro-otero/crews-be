const { actions } = require('../redux/state');

const createMessagesFactory = require('./messages');

const {
  isTimeout,
  is429, sleep,
  isThereNext,
  searchPage,
  searchNext,
  releaseTask,
} = require('./utils');

module.exports = ({ db, PAUSE_NEEDED_AFTER_429 }, createLogger) => (album) => {
  const LOGGER = createLogger(album);
  const MESSAGES = createMessagesFactory(album);
  const tasks = [searchPage(1)];

  let lastPage;
  let currentTask;

  const results = (page) => {
    LOGGER.info(MESSAGES.results(page));
    actions.setLastSearchPage(album.id, page);
    tasks.push(...page.results.map((_, data) => (releaseTask(data))));
    if (isThereNext(page)) {
      tasks.push(searchNext(page));
    }
    lastPage = page;
  };

  const sendRelease = (release) => {
    LOGGER.info(MESSAGES.release(release, currentTask.data + 1, lastPage));
    actions.setLastRelease(album.id, release);
    if (release.tracklist.length === album.tracks.items.length) {
      actions.addCredits(album, release);
    } else {
      LOGGER.debug(MESSAGES.albumMismatch(release));
    }
  };

  const logTimeout = () => {
    if (currentTask.type === 'search') {
      LOGGER.error(MESSAGES.searchPageTimeout(currentTask.data));
    } else {
      const number = currentTask.data + 1;
      const releaseId = lastPage.results[currentTask.data].id;
      LOGGER.error(MESSAGES.releaseTimeout(releaseId, number, lastPage.results.length));
    }
  };

  const logError = (error) => {
    LOGGER.error(MESSAGES.exception(error));
    actions.clearSearch(album.id);
  };

  const run = ({ type, data }) => ({
    search: page => db.search({
      artist: album.artists[0].name,
      release_title: album.name.replace(/(.+) \((.+)\)/, '$1'),
      type: 'release',
      per_page: 100,
      page,
    }),
    release: index => db.getRelease(lastPage.results[index].id),
    wait: time => sleep(time),
  })[type](data);

  const makeItWait = () => tasks.unshift({
    type: 'wait',
    data: PAUSE_NEEDED_AFTER_429,
  });

  const complete = ({ type }) => ({
    search: results,
    release: sendRelease,
    wait: () => {},
  })[type];

  const doTask = () => {
    currentTask = tasks.shift();
    try {
      run(currentTask).then(complete(currentTask), (error) => {
        if (isTimeout(error)) {
          logTimeout();
          tasks.unshift(currentTask);
        } else if (is429(error)) {
          LOGGER.error(MESSAGES.tooManyRequests(PAUSE_NEEDED_AFTER_429));
          tasks.unshift(currentTask);
          makeItWait();
        } else {
          throw error;
        }
      }).catch((error) => {
        actions.removeSearch(album.id);
        logError(error);
        tasks.splice(0, tasks.length);
      }).then(() => {
        if (tasks.length) {
          doTask();
        } else {
          LOGGER.info(MESSAGES.finish());
        }
      });
    } catch (error) {
      logError(error);
    }
  };

  const start = () => {
    doTask();
  };

  return { start };
};
