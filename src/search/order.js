module.exports = (results, album) => results.sort((a, b) => {
  const score = ({ title, year, format }) => [

    // Exact title
    `${album.artists[0].name} - ${album.name}` === title,

    // Album title part of the full release title
    title.match(`.+ - ${album.name.replace(/(.+) \((.+)\)/, '$1').toUpperCase()}`),

    // Year
    year === album.release_date.substring(0, 4),

    // Format
    (((typeof format === 'string') ?
      format.split(', ') :
      (format || [])).map(f => f.toUpperCase())).includes(album.album_type.toUpperCase()),
  ].reduce((accum, result) => accum + Number(result));
  return score(b) - score(a);
});
