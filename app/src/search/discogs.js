const Rx = require('rxjs');

const order = (results, album) => results.sort((a, b) => {
  const score = ({ title, year, format }) => [

    // Exact title
    `${album.artists[0].name} - ${album.name}` === title,

    // Album title part of the full release title
    title.match(`.+ - ${album.name.replace(/(.+) \((.+)\)/, '$1').toUpperCase()}`),

    // Year
    year === album.release_date.substring(0, 4),

    // Format
    (((typeof format === 'string') ?
      format.split(', ') :
      (format || [])).map(f => f.toUpperCase())).includes(album.album_type.toUpperCase()),
  ].reduce((accum, result) => accum + Number(result));
  return score(b) - score(a);
});

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
      search(album, p).then(async (page) => {
        observer.next({ type: 'results', data: { page } });
        const results = order(page.results, album);
        // eslint-disable-next-line no-restricted-syntax
        for (const result of results) {
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
      }, observer.error.bind(observer));
    };

    fetch(1);
  });

  return { findReleases };
};
