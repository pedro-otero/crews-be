const winston = require('winston');

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
        const {
          album: {
            artists: [{ name: artist }],
            name: album,
            id: albumId,
          },
          page: {
            pagination: { page: currentPage, pages: totalPages },
            results,
          },
          release: { id: releaseId, master_id: masterId },
          i,
        } = info.message;
        return `${artist} - ${album} (${albumId}) :: P(${currentPage}/${totalPages}) R(${(i + 1)}/${results.length}) Release ${releaseId} (master ${masterId}) retrieved`;
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
