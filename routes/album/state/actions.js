const ADD_SEARCH = 'ADD_SEARCH';

const addSearch = id => ({
  type: ADD_SEARCH,
  id,
});

const ADD_ALBUM = 'ADD_ALBUM';

const addAlbum = album => ({
  type: ADD_ALBUM,
  album,
});

module.exports = {
  ADD_SEARCH, addSearch,
  ADD_ALBUM, addAlbum
};