const similarity = require('string-similarity').compareTwoStrings;

module.exports = (spotify, discogs) => {
  if (discogs.length !== spotify.length) {
    return false;
  }

  return spotify
    .map(track => track.name)
    .map((track, i) => similarity(track, discogs[i].title))
    .reduce((sum, current, i, array) => sum + (current / array.length), 0);
};
