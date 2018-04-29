const { actions } = require('../redux/state');

const spotifyErrorMessages = require('./spotify-errors');

const getOutput = (id) => {
  let album;
  let logger;
  const pages = [];
  let nextPage = 1;
  let nextReleaseIndex;
  let nextReleaseId;
  const indicator = (current, total) => `${current}/${total}`;
  const tag = () => {
    const {
      artists: [{ name: artist }],
      name,
      id: albumId,
    } = album;
    return `${new Date().toLocaleString()} ${artist} - ${name} (${albumId}) ::`;
  };
  const resultsMsg = (pageObject) => {
    const {
      pagination: { page, pages: pn },
      results,
    } = pageObject;
    return `${tag(album)} P ${indicator(page, pn)}: ${results.length} items`;
  };

  const releaseMsg = (release) => {
    const page = pages.find(p => p.results.find(r => r.id === release.id) !== undefined);
    const i = page.results.findIndex(r => r.id === release.id) + 1;
    const {
      pagination: { page: current, pages: pn },
      results,
    } = page;
    const { id: rId, master_id: masterId } = release;
    return `${tag(album)} P(${indicator(current, pn)}) I(${indicator(i, results.length)}) R-${rId} (M-${masterId}) OK`;
  };
  return {
    addSearch: () => actions.addSearch(id),
    addAlbum: (searchAlbum) => {
      album = searchAlbum;
      actions.addAlbum(album);
    },
    abort: () => actions.removeSearch(id),
    setLogger: (_logger) => {
      logger = _logger;
    },
    results: (page) => {
      nextPage = null;
      nextReleaseIndex = 0;
      nextReleaseId = page.results[0].id;
      logger.say(resultsMsg(page));
      actions.setLastSearchPage(album.id, page);
      pages.push(page);
    },
    sendRelease: (release) => {
      nextReleaseId = pages[pages.length - 1].results[nextReleaseIndex].id;
      nextReleaseIndex += 1;
      if (nextReleaseIndex > pages[pages.length - 1].results.length - 1) {
        nextReleaseIndex = null;
        nextReleaseId = null;
        nextPage = pages[pages.length - 1].pagination.page + 1;
      }
      logger.say(releaseMsg(release));
      actions.setLastRelease(album.id, release);
      if (release.tracklist.length === album.tracks.items.length) {
        actions.addCredits(album, release);
      } else {
        logger.detail(`${tag(album)} R-${release.id} tracklist length (${release.tracklist.length}) does not match the album's (${album.tracks.items.length})`);
      }
    },
    timeout: () => {
      if (!nextReleaseId) {
        logger.notice(`${tag(album)} SEARCH P-${nextPage} TIMEOUT`);
      } else {
        logger.notice(`${tag(album)} R-${nextReleaseId} P-(${indicator(nextReleaseIndex + 1, pages[pages.length - 1].results.length)}) TIMEOUT`);
      }
    },
    tooManyRequests: (time) => {
      logger.notice(`${tag(album)} A 429 was thrown (too many requests). Search will pause for ${time / 1000}s`);
    },
    sendError: (error) => {
      logger.notice(`${tag(album)} EXCEPTION. Search removed. ${error}`);
      actions.clearSearch(id);
    },
    complete: () => logger.say(`${tag(album)} FINISHED`),
  };
};

const isTimeout = ({ code, errno }) => code === 'ETIMEDOUT' && errno === 'ETIMEDOUT';

const is429 = ({ statusCode }) => statusCode === 429;

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const isThereNext = ({ pagination: { page, pages } }) => page < pages;

module.exports = (spotify, discogs, createLogger) => (id) => {
  let output;
  let album;
  const tasks = [];

  const albumRejection = (reason) => {
    const code = String(reason.statusCode);
    if (code in spotifyErrorMessages.http) {
      return Error(spotifyErrorMessages.http[code]);
    }
    return Error(spotifyErrorMessages.general);
  };

  const handleDiscogsError = (resolve, reject) => (error) => {
    if (isTimeout(error)) {
      output.timeout();
      reject(Error('repeat'));
    } else if (is429(error)) {
      output.tooManyRequests(discogs.PAUSE_NEEDED_AFTER_429);
      reject(Error('wait'));
    } else {
      output.abort();
      output.sendError(error);
    }
  };

  const getSearchPage = pageN => new Promise((resolve, reject) => discogs.db.search({
    artist: album.artists[0].name,
    release_title: album.name.replace(/(.+) \((.+)\)/, '$1'),
    type: 'release',
    per_page: 100,
    page: pageN,
  }).then((page) => {
    output.results(page);
    tasks.push(...page.results.map(r => ({ type: 'release', data: r.id })));
    if (isThereNext(page)) {
      tasks.push({ type: 'search', data: page.pagination.page + 1 });
    }
    resolve();
  }, handleDiscogsError(resolve, reject)).catch(output.sendError));

  const getRelease = releaseId => new Promise((resolve, reject) => {
    discogs.db.getRelease(releaseId).then((release) => {
      output.sendRelease(release);
      resolve();
    }, handleDiscogsError(resolve, reject));
  });

  const taskDoers = {
    search: page => getSearchPage(page),
    release: releaseId => getRelease(releaseId),
    wait: time => sleep(time),
  };

  const performTask = async () => {
    const top = tasks.shift();
    try {
      await taskDoers[top.type](top.data);
    } catch (error) {
      if (error.message === 'wait' || error.message === 'repeat') {
        tasks.unshift(top);
        if (error.message === 'wait') {
          tasks.unshift({ type: 'wait', data: discogs.PAUSE_NEEDED_AFTER_429 });
        }
      } else {
        output.abort();
        output.sendError(error);
      }
    }
    if (tasks.length) {
      await performTask();
    } else {
      output.complete();
    }
  };

  const start = () => new Promise((resolve, reject) => {
    output = getOutput(id);
    spotify.getApi()
      .then((api) => {
        output.addSearch(id);
        return api.getAlbum(id);
      }, () => reject(Error(spotifyErrorMessages.login)))
      .then(({ body }) => {
        album = body;
        output.addAlbum(album);
        output.setLogger(createLogger(album));
        tasks.push({ type: 'search', data: 1 });
        performTask();
        resolve({ id, progress: 0, bestMatch: null });
      }, (reason) => {
        reject(albumRejection(reason));
        output.abort();
      }).catch(reject);
  });

  return { start };
};
