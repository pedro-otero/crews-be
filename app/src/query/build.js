module.exports = (spotifyAlbum, credits) => ({
  tracks: spotifyAlbum.tracks.map(track => ({
    id: track.id,
    title: track.name,
    trackCredits: credits.filter(credit => credit.track === track.id),
  })).map(({ id, title, trackCredits }) => ({
    id,
    title,
    producers: trackCredits
      .filter(c => c.role === 'Producer')
      .map(c => c.name),
    composers: trackCredits
      .filter(c => c.role === 'Composer')
      .map(c => c.name),
    featured: trackCredits
      .filter(c => c.role === 'Featured')
      .map(c => c.name),
    credits: trackCredits
      .filter(credit => !['Producer', 'Composer', 'Featured'].includes(credit.role))
      .reduce((tree, credit) => Object.assign({}, tree, ({
        [credit.name]: (tree[credit.name] || []).concat([credit.role]),
      })), {}),
  })),
});
