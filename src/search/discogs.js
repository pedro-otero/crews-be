const Rx = require('rxjs');

const order = require('./order');

module.exports = function (db) {
  const search = async ({
    name,
    artists: [{
      name: artist,
    }],
  }, page) => db.search({
    artist,
    release_title: name.replace(/(.+) \((.+)\)/, '$1'),
    type: 'release',
    per_page: 100,
    page,
  });

  this.findReleases = album => Rx.Observable.create((observer) => {
    async function getAllReleases(page) {
      const results = order(page.results, album);
      let i = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const result of results) {
        // eslint-disable-next-line no-await-in-loop
        const release = await db.getRelease(result.id);
        observer.next({ type: 'release', data: { release, i } });
        i += 1;
      }
    }

    const fetch = async (p) => {
      const page = await search(album, p);
      observer.next({ type: 'results', data: { page } });
      await getAllReleases(page);
      if (page.pagination.page < page.pagination.pages) {
        fetch(page.pagination.page + 1);
      } else {
        observer.complete();
      }
    };

    fetch(1);
  });
};
