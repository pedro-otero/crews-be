const winston = require('winston');

const { printf, combine } = winston.format;

const levels = {
  finish: 0,
  results: 1,
  release: 2,
  error: 3,
};
const createTransports = () => [new winston.transports.Console({ level: 'error' })];

module.exports = function (album) {
  const {
    artists: [{ name: artist }],
    name,
    id: albumId,
  } = album;

  const tag = () => `${artist} - ${name} (${albumId}) ::`;

  const indicator = (current, total) => `${current}/${total}`;

  function releaseMsg({
    message: {
      page, release, i,
    },
  }) {
    const {
      pagination: { page: currentPage, pages: totalPages },
      results,
    } = page;
    const { id: releaseId, master_id: masterId } = release;
    return `${tag(album)} P(${indicator(currentPage, totalPages)}) I(${indicator(String(i + 1), results.length)}) R-${releaseId} (M-${masterId}) OK`;
  }

  function resultsMsg({
    message: {
      page,
    },
  }) {
    const {
      pagination: { page: currentPage, pages: totalPages },
      results,
    } = page;
    return `${tag(album)} P ${indicator(currentPage, totalPages)}: ${results.length} items`;
  }

  return winston.createLogger({
    levels,
    format: combine(printf((info) => {
      switch (info.level) {
        case 'finish':
          return info.message;
        case 'results':
          return resultsMsg(info);
        case 'release':
          return releaseMsg(info);
        default:
          return info.message;
      }
    })),
    transports: createTransports(),
  });
};
