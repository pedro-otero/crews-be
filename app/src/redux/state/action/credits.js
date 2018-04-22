const { ADD_CREDITS } = require('./constants');

const splitTrim = (value,separator) => value.split(separator).map(v => v.trim());

module.exports = ({ tracks: { items } }, { tracklist, extraartists: releaseExtraArtists }) => {
  const translatePosition = position => tracklist.findIndex(t => t.position === position);
  const temp = tracklist.map(({ position, extraartists = [] }) => ({
    position,
    extraartists: extraartists.concat(releaseExtraArtists
      .filter(({ tracks, role }) => !!tracks && !!role)
      .filter(({ tracks }) => splitTrim(tracks,',')
        .reduce((accum, trackString) => accum || (() => {
          if (trackString.includes('-')) {
            const extremes = splitTrim(trackString,'-');
            return (translatePosition(extremes[0]) <= translatePosition(position)) && (translatePosition(position) <= translatePosition(extremes[1]));
          } else if (trackString.includes('to')) {
            const extremes = splitTrim(trackString,'to');
            return (translatePosition(extremes[0]) <= translatePosition(position)) && (translatePosition(position) <= translatePosition(extremes[1]));
          }
          return trackString.split(',').map(t => t.trim()).includes(position);
        })(), false))
      .reduce((accum, { role, name }) => accum.concat([{ role, name }]), [])),
  })).map(({ extraartists: credits }, i) => ({
    id: items[i].id,
    credits: credits.reduce((trackCredits, { name, role }) => trackCredits
      .concat(splitTrim(role,',').map(r => ({
        name,
        role: r,
      }))), []),
  })).reduce(
    (accum, { id, credits }) =>
      accum.concat(credits
        .map(({ name, role }) => ({ track: id, name, role }))),
    []);
  return {
    type: ADD_CREDITS,
    credits: temp,
  };
};
