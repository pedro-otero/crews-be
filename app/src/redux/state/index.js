const reduceCredits = require('./reducer/credits');
const getCredits = require('./action/credits');

const albums = [];
let searches = [];
let credits = [];

exports.actions = {
  addAlbum: ({
    id, artists: [{ name: artist }], name, tracks: { items },
  }) => {
    albums.push({
      id,
      name,
      artist,
      tracks: items.map(i => ({ id: i.id, name: i.name })),
    });
  },
  addCredits: (album, release) => {
    const newCredits = getCredits(album, release);
    credits = reduceCredits(credits, newCredits);
  },
  addSearch: (id) => {
    searches.push({ id });
  },
  setLastSearchPage: (id, {
    pagination: {
      page, pages, items, per_page: perPage,
    },
    results,
  }) => {
    searches = [
      Object.assign({}, searches.find(search => search.id === id), {
        lastSearchPage: {
          page,
          pages,
          items,
          perPage,
          releases: results.map(result => result.id),
        },
      }),
    ].concat(searches.filter(search => search.id !== id));
  },
  setLastRelease: (id, lastRelease) => {
    searches = [
      Object.assign({}, searches.find(search => search.id === id), { lastRelease }),
    ].concat(searches.filter(search => search.id !== id));
  },
  clearSearch: (id) => {
    searches = [
      Object.assign({}, searches.find(search => search.id === id), {
        lastRelease: null,
        lastSearchPage: null,
      }),
    ].concat(searches.filter(search => search.id !== id));
  },
  removeSearch: (id) => {
    searches = searches.filter(s => s.id !== id);
  },
};

exports.store = {
  getState: () => ({
    albums,
    credits,
    searches,
  }),
};
