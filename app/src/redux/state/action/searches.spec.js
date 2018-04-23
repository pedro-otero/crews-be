const assert = require('assert');

const {
  ADD_SEARCH,
  SET_LAST_SEARCH_PAGE,
} = require('./constants');
const create = require('./searches');

describe('Searches action creators', () => {
  context('creates add search action', () => {
    before(function () {
      this.action = create.addSearch(1);
    });

    it('sets ADD_SEARCH type', function () {
      assert.equal(this.action.type, ADD_SEARCH);
    });

    it('sets id', function () {
      assert.equal(this.action.id, 1);
    });
  });

  context('creates setLastSearchPage action', () => {
    before(function () {
      this.action = create.setLastSearchPage(1, {
        pagination: {
          page: 1,
          pages: 2,
          items: 500,
          per_page: 100,
        },
        results: [{ id: 1 }],
      });
    });

    it('sets SET_LAST_SEARCH_PAGE type', function () {
      assert.equal(this.action.type, SET_LAST_SEARCH_PAGE);
    });

    it('sets id', function () {
      assert.equal(this.action.id, 1);
    });

    it('sets lastSearchPage.page', function () {
      assert.equal(this.action.lastSearchPage.page, 1);
    });

    it('sets lastSearchPage.pages', function () {
      assert.equal(this.action.lastSearchPage.pages, 2);
    });

    it('sets lastSearchPage.items', function () {
      assert.equal(this.action.lastSearchPage.items, 500);
    });

    it('sets lastSearchPage.perPage', function () {
      assert.equal(this.action.lastSearchPage.perPage, 100);
    });

    it('sets lastSearchPage.releases', function () {
      assert.equal(this.action.lastSearchPage.releases[0], 1);
    });
  });
});
