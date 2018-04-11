const winston = require('winston');

const { printf, combine, timestamp: timestampFormat } = winston.format;

const levels = {
  finish: 0,
  results: 1,
  release: 2,
  error: 3,
};
const createTransports = albumId => [
  new winston.transports.Console({ level: 'error' }),
  new winston.transports.File({ filename: `log/${albumId}.log`, level: 'error' }),
];

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
    timestamp,
  }) => {
    let result = `${timestamp} `;
    switch (level) {
      case 'finish':
        result += `${tag(album)} FINISHED`;
        break;
      case 'results':
        result += resultsMsg(page);
        break;
      case 'release':
        result += releaseMsg(page, release, i);
        break;
      default:
        result += text;
    }
    return result;
  };

  return winston.createLogger({
    levels,
    format: combine(timestampFormat(), printf(formatFunction)),
    transports: createTransports(album.id),
  });
};
