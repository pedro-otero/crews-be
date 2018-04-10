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

  const releaseMsg = (page, release, i) => {
    const {
      pagination: { page: current, pages },
      results,
    } = page;
    const { id, master_id: masterId } = release;
    return `${tag(album)} P(${indicator(current, pages)}) I(${indicator((1 + +i), results.length)}) R-${id} (M-${masterId}) OK`;
  };

  const resultsMsg = ({
    pagination: { page, pages },
    results,
  }) => `${tag(album)} P ${indicator(page, pages)}: ${results.length} items`;

  const formatFunction = ({
    level,
    message: {
      page,
      release,
      i,
      text,
    },
  }) => {
    switch (level) {
      case 'finish':
        return `${tag(album)} FINISHED`;
      case 'results':
        return resultsMsg(page);
      case 'release':
        return releaseMsg(page, release, i);
      default:
        return text;
    }
  };

  return winston.createLogger({
    levels,
    format: combine(printf(formatFunction)),
    transports: createTransports(),
  });
};
