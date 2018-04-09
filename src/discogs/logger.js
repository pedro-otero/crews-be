const winston = require('winston');

module.exports = function (album) {
  const {
    artists: [{ name: artist }],
    name,
    id: albumId,
  } = album;

  const tag = () => `${artist} - ${name} (${albumId}) ::`;

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
    const pageIndicator = `${currentPage}/${totalPages}`;
    const itemIndicator = `${String(i + 1)}/${results.length}`;
    return `${tag(album)} P(${pageIndicator}) I(${itemIndicator}) R-${releaseId} (M-${masterId}) OK`;
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
    const pageIndicator = `${currentPage}/${totalPages}`;
    return `${tag(album)} P ${pageIndicator}: ${results.length} items`;
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
          return resultsMsg(info);
        case 'release':
          return releaseMsg(info);
        default:
          return info.message;
      }
    })),
    transports: [
      new winston.transports.Console({ level: 'error' }),
    ],
  });

  return logger;
};
