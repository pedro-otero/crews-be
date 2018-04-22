const { ADD_CREDITS } = require('./constants');

const inRange = (position, trackString) => {
  if (trackString.includes('-')) {
    const extremes = trackString.split('-').map(n => Number(n));
    return (extremes[0] <= Number(position)) && (Number(position) <= extremes[1]);
  }
  return trackString.split(',').map(t => t.trim()).includes(position);
}

module.exports = ({ tracks: { items } }, { tracklist, extraartists: releaseExtraArtists }) => {
  const temp = tracklist.map(({ position, extraartists = [] }) => ({
    position,
    extraartists: extraartists.concat(releaseExtraArtists
      .filter(({ tracks }) => tracks
        .split(',')
        .map(t => t.trim())
        .reduce((accum, trackString) => accum || inRange(position, trackString), false))
      .reduce((accum, { role, name }) => accum.concat([{ role, name }]), [])),
  })).map(({ extraartists: credits }, i) => ({
    id: items[i].id,
    credits: credits.reduce((trackCredits, { name, role }) => trackCredits
      .concat(role.split(',').map(r => r
        .trim()).map(r => ({
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
