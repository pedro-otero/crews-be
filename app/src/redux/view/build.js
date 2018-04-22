const roles = require('./roles');

module.exports = (spotifyAlbum, credits) => ({
  tracks: spotifyAlbum.tracks.items.map(track => ({
    id: track.id,
    title: track.name,
    trackCredits: credits.filter(credit => credit.track === track.id),
  })).map(({ id, title, trackCredits }) => ({
    id,
    title,
    producers: [],
    composers: [],
    featured: [],
    credits: trackCredits.reduce((tree, credit) => Object.assign({}, tree, ({
      [credit.name]: (tree[credit.name] || []).concat([credit.role]),
    })), {}),
  })),
});
