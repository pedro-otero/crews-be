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

  const releaseMsg = ({
    message: {
      page: {
        pagination: { page, pages },
        results,
      }, release: { id, master_id: masterId }, i,
    },
  }) => `${tag(album)} P(${indicator(page, pages)}) I(${indicator(String(i + 1), results.length)}) R-${id} (M-${masterId}) OK`;

  const resultsMsg = ({
    message: {
      page: {
        pagination: { page, pages },
        results,
      },
    },
  }) => `${tag(album)} P ${indicator(page, pages)}: ${results.length} items`;

  const formatFunction = (info) => {
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
  };

  return winston.createLogger({
    levels,
    format: combine(printf(formatFunction)),
    transports: createTransports(),
  });
};
