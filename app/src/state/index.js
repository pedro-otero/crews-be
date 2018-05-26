const accents = require('remove-accents');

const hasAccentedName = c => accents.has(c.name);

const albums = [];
let searches = [];
let credits = [];

const roles = require('./roles');

const mappedRole = (role) => {
  if (roles.composers.includes(role)) {
    return 'Composer';
  }
  if (roles.producers.includes(role)) {
    return 'Producer';
  }
  if (roles.featured.includes(role)) {
    return 'Featured';
  }
  return role;
};

const splitTrim = (value, separator) => value.split(separator).map(v => v.trim());

module.exports = {
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
    const { tracks: items } = album;
    const { tracklist, extraartists: releaseExtraArtists } = release;
    const translatePosition = position => tracklist.findIndex(t => t.position === position);
    const inRange = (trackString, separator, position) => {
      const extremes = splitTrim(trackString, separator);
      const left = translatePosition(extremes[0]);
      const p = translatePosition(position);
      const right = translatePosition(extremes[1]);
      return (left <= p) && (p <= right);
    };
    const newCredits = tracklist.map(({ position, extraartists = [] }) => ({
      position,
      extraartists: extraartists.concat((releaseExtraArtists || [])
        .filter(({ tracks, role }) => !!tracks && !!role)
        .filter(({ tracks }) => splitTrim(tracks, ',')
          .reduce((accum, trackString) => accum || (() => {
            if (trackString.includes('-')) {
              return inRange(trackString, '-', position);
            } else if (trackString.includes('to')) {
              return inRange(trackString, 'to', position);
            }
            return splitTrim(trackString, ',').includes(position);
          })(), false))
        .reduce((accum, { role, name }) => accum.concat([{ role, name }]), [])),
    })).map(({ extraartists }, i) => ({
      id: items[i].id,
      trackCredits: extraartists.reduce((trackCredits, { name, role }) => trackCredits
        .concat(splitTrim(role, ',').map(r => ({
          name,
          role: r,
        }))), []),
    })).reduce(
      (accum, { id, trackCredits }) =>
        accum.concat(trackCredits
          .map(({ name, role }) => ({ track: id, name, role: mappedRole(role) }))),
      []
    );
    credits = newCredits
      .filter(c => !hasAccentedName(c))
      .concat(credits.filter(c => !hasAccentedName(c)))
      .reduce((all, current) => {
        if (all.find(item =>
          accents.remove(item.name) === current.name &&
            item.role === current.role &&
            item.track === current.track)) {
          return all;
        }
        return all.concat([current]);
      }, newCredits
        .filter(hasAccentedName)
        .concat(credits.filter(hasAccentedName)))
      .reduce((all, current) => {
        if (all.find(item =>
          item.name === current.name &&
            item.role === current.role &&
            item.track === current.track)) {
          return all;
        }
        return all.concat([current]);
      }, []);
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
  setLastRelease: (id, release) => {
    searches = [
      Object.assign({}, searches.find(search => search.id === id), { lastRelease: release.id }),
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
  data: () => ({
    albums,
    credits,
    searches,
  }),
};
