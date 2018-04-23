const {
  ADD_SEARCH,
  SET_LAST_SEARCH_PAGE,
  SET_LAST_RELEASE,
} = require('./constants');

const addSearch = id => ({
  type: ADD_SEARCH,
  id,
});

const setLastSearchPage = (id, {
  pagination: {
    page, pages, items, per_page: perPage,
  },
  results,
}) => ({
  type: SET_LAST_SEARCH_PAGE,
  id,
  lastSearchPage: {
    page,
    pages,
    items,
    perPage,
    releases: results.map(result => result.id),
  },
});

const setLastRelease = (id, release) => ({
  type: SET_LAST_RELEASE,
  id,
  lastRelease: release.id,
});

module.exports = {
  addSearch,
  setLastSearchPage,
  setLastRelease,
};
