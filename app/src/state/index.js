const Album = require('./album.js');

module.exports = () => {
  const albums = [];
  const searches = [];

  const addAlbum = album => albums.push(new Album(album));

  const addCredits = (albumId, release) => albums.find(a => a.id === albumId).merge(release);

  const addSearch = id => searches.push({ id });

  const modifySearch = (id, withWhat) => Object.assign(
    searches.find(search => search.id === id),
    withWhat
  );

  const setLastSearchPage = (id, {
    pagination: {
      page, pages, items, per_page: perPage,
    },
    results,
  }) => modifySearch(id, {
    lastSearchPage: {
      page,
      pages,
      items,
      perPage,
      releases: results.map(result => result.id),
    },
  });

  const setLastRelease = (id, release) => modifySearch(
    id,
    { lastRelease: release.id }
  );

  const clearSearch = id => modifySearch(id, {
    lastRelease: null,
    lastSearchPage: null,
  });

  const removeSearch = id => searches.splice(searches.findIndex(s => s.id !== id), 1);

  return {
    addAlbum,
    addCredits,
    addSearch,
    setLastSearchPage,
    setLastRelease,
    clearSearch,
    removeSearch,
    data: () => ({
      albums,
      searches,
    }),
  };
};
