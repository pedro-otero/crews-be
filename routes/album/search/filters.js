const similarity = require('string-similarity').compareTwoStrings;

module.exports = (spotify, discogs) => {

  if (discogs.length !== spotify.length) {
    return false;
  }

  const album = spotify.map(track => track.name);
  const release = discogs.map(track => track.title);

  const similarities = album.map((track, i) => similarity(track, release[i]));

  const sum = similarities.reduce((sum, similarity) => sum + similarity, 0);
  return (sum / similarities.length);
};