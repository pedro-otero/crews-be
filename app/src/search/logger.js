const winston = require('winston');

const { printf, combine, timestamp: timestampFormat } = winston.format;

const levels = {
  info: 0,
  finish: 1,
  results: 2,
  release: 3,
  error: 4,
};
const createTransports = albumId => [
  new winston.transports.Console({ level: 'error' }),
  new winston.transports.File({ filename: `app/log/${albumId}.log`, level: 'error' }),
];

module.exports = function (album) {
  const {
    artists: [{ name: artist }],
    name,
    id: albumId,
  } = album;

  const tag = () => `${artist} - ${name} (${albumId}) ::`;

  const formatFunction = ({
    level,
    message: {
      text,
      error,
    },
    timestamp,
  }) => {
    let result = `${timestamp} `;
    switch (level) {
      case 'finish':
        result += `${tag(album)} FINISHED`;
        break;
      case 'error':
        result += error.stack;
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
