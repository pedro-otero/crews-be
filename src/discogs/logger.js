const winston = require('winston');

function tag(album) {
  const {
    artists: [{ name: artist }],
    name,
    id: albumId,
  } = album;
  return `${artist} - ${name} (${albumId}) ::`;
}

function release(info) {
  const {
    page: {
      pagination: { page: currentPage, pages: totalPages },
      results,
    },
    release: { id: releaseId, master_id: masterId },
    i,
  } = info.message;
  const pageIndicator = `${currentPage}/${totalPages}`;
  const itemIndicator = `${String(i + 1)}/${results.length}`;
  return `${tag(info.message.album)} P(${pageIndicator}) I(${itemIndicator}) R-${releaseId} (M-${masterId}) OK`;
}

const { printf, combine } = winston.format;
const logger = winston.createLogger({
  levels: {
    finish: 0,
    results: 1,
    release: 2,
    error: 3,
  },
  format: combine(printf((info) => {
    switch (info.level) {
      case 'finish':
        return info.message;
      case 'results':
        return info.message;
      case 'release':
        return release(info);
      default:
        return info.message;
    }
  })),
  transports: [
    new winston.transports.Console({ level: 'finish' }),
    new winston.transports.Console({ level: 'results' }),
    new winston.transports.Console({ level: 'release' }),
    new winston.transports.Console({ level: 'error' }),
  ],
});

module.exports = logger;
