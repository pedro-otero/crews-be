function splitRange(tracksstring) {
    var split = tracksstring.split('to').map(s => s.trim());
    var tracks = [];
    var start = split[0];
    var end = split[1];
    for (var i = Number(start); i <= Number(end); i++) {
        tracks.push(i.toString());
    }
    return tracks;
};

const getTracksList = tracksstring => tracksstring
    .split(',')
    .map(s => s.trim())
    .map(el => el.includes('to') ? splitRange(el) : el)
    .reduce((a, b) => a.concat(b), []);

const roles = {
    producers: ['Producer', 'Produced By', 'Producer [Produced By]'],
    composers: ['Written-By', 'Lyrics By', 'Music By'],
    featured: ['Featuring', 'feat.']
};

const reduce = allCredits => highlightedRole => allCredits
    .filter(credit => credit.role.split(', ')
        .some(role => roles[highlightedRole].includes(role)))
    .map(credit => credit.name);

const buildSong = discogsRelease => (spotifyTrack, trackIndex) => {
    const track = discogsRelease.tracklist[trackIndex];
    const position = track.position || String(trackIndex + 1);
    const allCredits = (discogsRelease.extraartists || [])
        .filter(credit => getTracksList(credit.tracks).includes(position))
        .concat(track.extraartists || []);
    const result = {
        title: spotifyTrack.name,
        producers: reduce(allCredits)('producers'),
        composers: reduce(allCredits)('composers'),
        featured: reduce(allCredits)('featured'),
        credits: allCredits.reduce((credits, credit) => {
            const newCredits = credit.role.split(', ')
                .filter(role => !roles.producers.includes(role) &&
                    !roles.composers.includes(role) &&
                    !roles.featured.includes(role));
            if (newCredits.length) {
                if (!(credit.name in credits)) {
                    credits[credit.name] = [];
                }
                credits[credit.name].push(...newCredits);
            }
            return credits;
        }, {}),
    };
    return result;
}

module.exports = (spotifyAlbum, discogsRelease) => ({
    tracks: spotifyAlbum.tracks.items.map(buildSong(discogsRelease))
});