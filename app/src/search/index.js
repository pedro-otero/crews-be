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

const getNext = ({ pagination: { page } }) => page + 1;

module.exports = (spotify, discogs, createLogger) => (id) => {
  const albumRejection = (reason) => {
    const code = String(reason.statusCode);
    if (code in spotifyErrorMessages.http) {
      return Error(spotifyErrorMessages.http[code]);
    }
    return Error(spotifyErrorMessages.general);
  };

  const search = (album, page) => discogs.db.search({
    artist: album.artists[0].name,
    release_title: album.name.replace(/(.+) \((.+)\)/, '$1'),
    type: 'release',
    per_page: 100,
    page,
  });

  const findReleases = (album, searchObserver) => {
    let pageNumber = 1;
    let idleTime = 0;
    const fetch = async () => {
      try {
        await sleep(idleTime);
        search(album, pageNumber).then(async (page) => {
          idleTime = 0;
          searchObserver.results(page);
          const results = [...page.results];
          let result = results.shift();
          while (result) {
            // eslint-disable-next-line no-await-in-loop
            await sleep(idleTime);
            try {
              // eslint-disable-next-line no-await-in-loop
              const release = await discogs.db.getRelease(result.id);
              searchObserver.sendRelease(release);
              idleTime = 0;
            } catch (error) {
              if (isTimeout(error)) {
                searchObserver.timeout();
                results.unshift(result);
              } else if (is429(error)) {
                idleTime = discogs.PAUSE_NEEDED_AFTER_429;
                searchObserver.tooManyRequests(discogs.PAUSE_NEEDED_AFTER_429);
                results.unshift(result);
              } else {
                searchObserver.abort();
                searchObserver.sendError(error);
                return;
              }
            }
            result = results.shift();
          }
          if (isThereNext(page)) {
            pageNumber = getNext(page);
            fetch();
          } else {
            searchObserver.complete();
          }
        }, (error) => {
          if (isTimeout(error)) {
            searchObserver.timeout();
            fetch();
          } else if (is429(error)) {
            idleTime = discogs.PAUSE_NEEDED_AFTER_429;
            searchObserver.tooManyRequests(discogs.PAUSE_NEEDED_AFTER_429);
            fetch();
          } else {
            searchObserver.abort();
            searchObserver.sendError(error);
          }
        }).catch(searchObserver.sendError);
      } catch (error) {
        searchObserver.sendError(error);
      }
    };

    fetch();
  };

  const start = () => new Promise((resolve, reject) => {
    const output = getOutput(id);
    spotify.getApi()
      .then((api) => {
        output.addSearch(id);
        return api.getAlbum(id);
      }, () => reject(Error(spotifyErrorMessages.login)))
      .then(({ body }) => {
        const album = body;
        output.addAlbum(album);
        output.setLogger(createLogger(album));
        findReleases(album, output);
        resolve({ id, progress: 0, bestMatch: null });
      }, (reason) => {
        reject(albumRejection(reason));
        output.abort();
      }).catch(reject);
  });

  return { start };
};
