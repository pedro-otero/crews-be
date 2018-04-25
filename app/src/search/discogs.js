const Rx = require('rxjs');

module.exports = function (db) {
  const search = (album, page) => db.search({
    artist: album.artists[0].name,
    release_title: album.name.replace(/(.+) \((.+)\)/, '$1'),
    type: 'release',
    per_page: 100,
    page,
  });

  const findReleases = album => Rx.Observable.create((observer) => {
    const fetch = async (p) => {
      try {
        search(album, p).then(async (page) => {
          observer.next({ type: 'results', data: { page } });
          // eslint-disable-next-line no-restricted-syntax
          for (const result of page.results) {
            try {
              // eslint-disable-next-line no-await-in-loop
              const release = await db.getRelease(result.id);
              observer.next({ type: 'release', data: { release } });
            } catch (error) {
              observer.error(error);
              return;
            }
          }
          if (page.pagination.page < page.pagination.pages) {
            fetch(page.pagination.page + 1);
          } else {
            observer.complete();
          }
        }, (error) => {
          observer.error(error);
        }).catch((error) => {
          observer.error(error);
        });
      } catch (error) {
        observer.error(error);
      }
    };

    fetch(1);
  });

  return { findReleases };
};
