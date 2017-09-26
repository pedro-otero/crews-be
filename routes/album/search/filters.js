function convert(result) {
    return {
        id: result.id,
        title: (result.title || '').toUpperCase(),
        format: ((typeof result.format === 'string') ? result.format.split(', ') : (result.format || [])).map(format => format.toUpperCase()),
        tracklist: (result.tracklist || []).map(track => track.title.toUpperCase()),
        released: result.released,
        year: result.year
    }
}

module.exports = album => {

    const filters = {

        'title': result => result.title.match(`.+ - ${album.name.replace(/(.+) \((.+)\)/, '$1').toUpperCase()}`),

        'exact title': result => result.title === (`${album.artists[0].name.toUpperCase()} - ${album.name.replace(/(.+) \((.+)\)/, '$1').toUpperCase()}`),

        'format': result => result.format.includes(album.album_type.toUpperCase()),

        'year': result => result.year == album.release_date.substr(0, 4),

        'tracklist': result => result.tracklist.length == album.tracks.items.length &&
            album.tracks.items.map(track => track.name.toUpperCase()).every((track, i) => {
                const titles = [track, result.tracklist[i]]
                    .map(title => title.replace(/(.+) \((.+)\)/, '$1 - $2'))
                    .map(title => title.split(' - ')[0]);
                return titles[0] === titles[1];
            }),

        'release date': result => result.released == album.release_date

    }

    const filterProxy = filterFunc => result => filters[filterFunc](convert(result));

    return {
        by: (...matcherNames) => collection => matcherNames.reduce((results, currentFilter, i) => {
            const postResults = results.filter(filterProxy(currentFilter));
            return (i === 0 || postResults.length) ? postResults : results;
        }, collection)
    }
}