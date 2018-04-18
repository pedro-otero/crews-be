module.exports = (results, {
  name,
  artists: [{ name: artist }],
  release_date: releaseDate,
  album_type: albumType,
}) => results.map((data) => {
  const {
    title,
    year,
    format,
  } = data;
  const comparisons = [
    `${artist} - ${name}` === title,
    title.match(`.+ - ${name.replace(/(.+) \((.+)\)/, '$1').toUpperCase()}`),
    year === releaseDate.substring(0, 4),
    (((typeof format === 'string') ?
      format.split(', ') :
      (format || [])).map(f => f.toUpperCase())).includes(albumType.toUpperCase()),
  ];
  const score = comparisons.reduce((accum, result) => accum + Number(result), 0);
  return { data, score };
}).reduce((ordered, item) => {
  const position = ordered.findIndex(innerItem => innerItem.score < item.score);
  if (position === -1) {
    return ordered.concat([item]);
  }
  const modified = [...ordered];
  modified.splice(position, 0, item);
  return modified;
}, []).map(item => item.data);
