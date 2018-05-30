module.exports = state => function (id) {
  const {
    searches, albums,
  } = state.data();

  const search = searches.find(item => item.id === id);
  if (!search) { return null; }

  const album = albums.find(item => item.id === id);

  const progress = (() => {
    const { lastSearchPage, lastRelease } = search;
    if (!lastSearchPage) {
      return 0;
    }
    const {
      page, items, perPage, releases,
    } = lastSearchPage;
    if (items === 0) {
      return 100;
    }
    const soFar = ((page - 1) * perPage) + (releases.indexOf(lastRelease) + 1);
    return Math.round((soFar / items) * 100);
  })();

  return { id, progress, bestMatch: album };
};
