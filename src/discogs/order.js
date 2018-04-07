module.exports = (results, {
  name, artists: [{ name: artist }], release_date: releaseDate, album_type: albumType,
}) => results.map((release, position) => {
  const exactTitle = `${artist} - ${name}`;
  let score = 0;
  if (exactTitle === release.title) {
    score += 1;
  }
  if (release.title.match(`.+ - ${name.replace(/(.+) \((.+)\)/, '$1').toUpperCase()}`)) {
    score += 1;
  }
  if (release.year === releaseDate.substring(0, 4)) {
    score += 1;
  }
  const format = ((typeof release.format === 'string') ?
    release.format.split(', ') :
    (release.format || [])).map(f => f.toUpperCase());
  if (format.includes(albumType.toUpperCase())) {
    score += 1;
  }
  return { position, score };
}).reduce((ordered, item) => {
  const position = ordered.findIndex(innerItem => innerItem.score < item.score);
  if (position === -1) {
    return ordered.concat([item]);
  }
  return [
    ...ordered.slice(0, position),
    item,
    ...ordered.slice(position, ordered.length),
  ];
}, []).map(item => results[item.position]);
