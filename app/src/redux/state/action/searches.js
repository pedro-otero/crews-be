const {
  ADD_SEARCH,
  SET_LAST_SEARCH_PAGE,
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

module.exports = {
  addSearch,
  setLastSearchPage,
};
