module.exports = (results, { name, artists: [{ name: artist }] }) => {
  return results.map((release, position) => {
    const exactTitle = `${artist} - ${name}`;
    let score = 0;
    if (exactTitle === release.title) {
      score++;
    }
    if (release.title.match(`.+ - ${name.replace(/(.+) \((.+)\)/, '$1').toUpperCase()}`)) {
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