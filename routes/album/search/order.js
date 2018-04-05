module.exports = (results, { name, artists: [{ name: artist }], release_date, album_type }) => {
  return results.map((release, position) => {
    const exactTitle = `${artist} - ${name}`;
    let score = 0;
    if (exactTitle === release.title) {
      score++;
    }
    if (release.title.match(`.+ - ${name.replace(/(.+) \((.+)\)/, '$1').toUpperCase()}`)) {
      score++;
    }
    if (release.year === release_date.substring(0, 4)) {
      score++;
    }
    const format = ((typeof release.format === 'string') ?
      release.format.split(', ') :
      (release.format || [])).map(format => format.toUpperCase());
    if (format.includes(album_type.toUpperCase())) {
      score++;
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
      ...ordered.slice(position, ordered.length)
    ]
  }, []).map(item => results[item.position]);
};