const Album = require('./album.js');

function State() {
  this.albums = [];
  this.searches = [];
}

State.prototype.addAlbum = function (album) {
  this.albums.push(new Album(album));
};

State.prototype.addCredits = function (albumId, release) {
  this.albums.find(a => a.id === albumId).merge(release);
};

State.prototype.addSearch = function (id) {
  this.searches.push({ id });
};

const modifySearch = (searches, id, withWhat) => Object.assign(
  searches.find(search => search.id === id),
  withWhat
);

State.prototype.setLastSearchPage = function (id, {
  pagination: {
    page, pages, items, per_page: perPage,
  },
  results,
}) {
  modifySearch(this.searches, id, {
    lastSearchPage: {
      page,
      pages,
      items,
      perPage,
      releases: results.map(result => result.id),
    },
  });
};

State.prototype.setLastRelease = function (id, release) {
  modifySearch(
    this.searches,
    id,
    { lastRelease: release.id }
  );
};

State.prototype.clearSearch = function (id) {
  modifySearch(
    this.searches,
    id,
    {
      lastRelease: null,
      lastSearchPage: null,
    }
  );
};

State.prototype.getProgress = function (id) {
  const { lastSearchPage, lastRelease } = this.searches.find(s => s.id === id);
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
};

State.prototype.removeSearch = function (id) {
  this.searches.splice(this.searches.findIndex(s => s.id !== id), 1);
};

module.exports = State;
