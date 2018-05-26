const accents = require('remove-accents');

const hasAccentedName = c => accents.has(c.name);

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

module.exports = () => {
  const albums = [];
  const searches = [];
  let credits = [];

  const addAlbum = ({
    id, artists: [{ name: artist }], name, tracks: { items },
  }) => {
    albums.push({
      id,
      name,
      artist,
      tracks: items.map(i => ({ id: i.id, name: i.name, credits: [] })),
    });
  };

  const addCredits = (album, release) => {
    const { tracks: items } = album;
    const { tracklist, extraartists: releaseExtraArtists } = release;
    const translatePosition = position => tracklist.findIndex(t => t.position === position);
    const inRange = (trackString, separator, position) => {
      const [left, right] = splitTrim(trackString, separator).map(translatePosition);
      const p = translatePosition(position);
      return (left <= p) && (p <= right);
    };

    // EXTRACT CREDITS FROM THE RELEASE
    // 1. Merge the release "extraartists" into each corresponding track "extraartists" array.
    //    Some releases in Discogs have an "extraartists" array which contains credits of
    //    individual tracks.
    //    The following lines map the contents of such array into an structure grouped by
    //    track, matching the existing one in "tracklist"
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
    }))

    // 2. Split the resulting credits array so there's one entry for every role
      .map(({ extraartists }, i) => ({
        id: items[i].id,
        trackCredits: extraartists.reduce((trackCredits, { name, role }) => trackCredits
          .concat(splitTrim(role, ',').map(r => ({
            name,
            role: r,
          }))), []),
      }))

      // 3. Map the full credits of each track to the structure in the state "credits" array,
      //    mapping special roles when they appear.
      .reduce(
        (accum, { id, trackCredits }) =>
          accum.concat(trackCredits
            .map(({ name, role }) => ({ track: id, name, role: mappedRole(role) }))),
        []
      );

    // MERGE NEWLY EXTRACTED CREDITS WITH THE ONES CURRENTLY IN STATE
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
  };

  const addSearch = id => searches.push({ id });

  const modifySearch = (id, withWhat) => Object.assign(
    searches.find(search => search.id === id),
    withWhat
  );

  const setLastSearchPage = (id, {
    pagination: {
      page, pages, items, per_page: perPage,
    },
    results,
  }) => {
    modifySearch(id, {
      lastSearchPage: {
        page,
        pages,
        items,
        perPage,
        releases: results.map(result => result.id),
      },
    });
  };

  const setLastRelease = (id, release) => modifySearch(
    id,
    { lastRelease: release.id }
  );

  const clearSearch = id => modifySearch(id, {
    lastRelease: null,
    lastSearchPage: null,
  });

  const removeSearch = id => searches.splice(searches.findIndex(s => s.id !== id), 1);

  return {
    addAlbum,
    addCredits,
    addSearch,
    setLastSearchPage,
    setLastRelease,
    clearSearch,
    removeSearch,
    data: () => ({
      albums,
      credits,
      searches,
    }),
  };
};
