module.exports = (results, { name, artists: [{ name: artist }] }) => {
  return results.map((release, position) => {
    const exactTitle = `${artist} - ${name}`;
    let score = 0;
    if (exactTitle === release.title) {
      score += 25;
    }
    if (release.title.match(`.+ - ${name.replace(/(.+) \((.+)\)/, '$1').toUpperCase()}`)) {
      score += 25;
    }
    return { position, score };
  }).reduce((ordered, item) => {
    if (ordered.length) {
      const position = ordered.findIndex(innerItem => innerItem.score < item.score);
      return [
        ...ordered.slice(0, position),
        item,
        ...ordered.slice(position, ordered.length)
      ]
    } else {
      return [item];
    }
  }, []).map(item => results[item.position]);
};