const { actions } = require('../redux/state');

const spotifyErrorMessages = require('./spotify-errors');

const isTimeout = ({ code, errno }) => code === 'ETIMEDOUT' && errno === 'ETIMEDOUT';

const is429 = ({ statusCode }) => statusCode === 429;

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const isThereNext = ({ pagination: { page, pages } }) => page < pages;

const indicator = (current, total) => `${current}/${total}`;

const resultsMsg = (tag, pageObject) => {
  const {
    pagination: { page, pages },
    results,
  } = pageObject;
  return `${tag} P ${indicator(page, pages)}: ${results.length} items`;
};

const releaseMsg = (tag, release, lastPage, currentTask) => {
  const {
    pagination: { page, pages },
    results,
  } = lastPage;
  const { id: rId, master_id: masterId } = release;
  return `${tag} P(${indicator(page, pages)}) I(${indicator(currentTask.data + 1, results.length)}) R-${rId} (M-${masterId}) OK`;
};

const albumMismatch = (tag, release, album) => `${tag} R-${release.id} tracklist length (${release.tracklist.length}) does not match the album's (${album.tracks.items.length})`;

const searchPageTimeout = (tag, page) => `${tag} SEARCH P-${page} TIMEOUT`;

const releaseTimeout = (tag, releaseId, releaseNumber, releasesLength) => `${tag} R-${releaseId} P-(${indicator(releaseNumber, releasesLength)}) TIMEOUT`;

const exception = (tag, error) => `${tag} EXCEPTION. Search removed. ${error}`;

const tooManyRequests = (tag, waitMs) => `${tag} A 429 was thrown (too many requests). Search will pause for ${waitMs / 1000}s`;

const finish = tag => `${tag} FINISHED`;

module.exports = (spotify, discogs, createLogger) => (id) => {
  let album;
  let currentTask;
  const tasks = [];
  let logger;
  let lastPage;
  let tag;

  const results = (page) => {
    tasks.push(...page.results.map((_, data) => ({ type: 'release', data })));
    if (isThereNext(page)) {
      tasks.push({ type: 'search', data: page.pagination.page + 1 });
    }
    logger.say(resultsMsg(tag, page));
    actions.setLastSearchPage(album.id, page);
    lastPage = page;
  };

  const sendRelease = (release) => {
    logger.say(releaseMsg(tag, release, lastPage, currentTask));
    actions.setLastRelease(album.id, release);
    if (release.tracklist.length === album.tracks.items.length) {
      actions.addCredits(album, release);
    } else {
      logger.detail(albumMismatch(tag, release, album));
    }
  };

  const logTimeout = () => {
    if (currentTask.type === 'search') {
      logger.notice(searchPageTimeout(tag, currentTask.data));
    } else {
      const number = currentTask.data + 1;
      const releaseId = lastPage.results[currentTask.data].id;
      logger.notice(releaseTimeout(tag, releaseId, number, lastPage.results.length));
    }
  };

  const sendError = (error) => {
    logger.notice(exception(tag, error));
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
          logger.notice(tooManyRequests(tag, discogs.PAUSE_NEEDED_AFTER_429));
          tasks.unshift(currentTask);
          makeItWait();
        } else {
          throw error;
        }
      }).catch((error) => {
        actions.removeSearch(id);
        sendError(error);
        tasks.splice(0, tasks.length);
      }).then(() => {
        if (tasks.length) {
          performTask();
        } else {
          logger.say(finish(tag));
        }
      });
    } catch (error) {
      sendError(error);
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
        tag = `${new Date().toLocaleString()} ${album.artists[0].name} - ${album.name} (${album.id}) ::`;
        actions.addAlbum(album);
        logger = createLogger(album);
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
