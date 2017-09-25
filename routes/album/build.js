const millisToTime = millis => {
    const seconds = millis / 1000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

const secsToTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

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
        explicit: spotifyTrack.explicit,
        duration: millisToTime(spotifyTrack.duration_ms),
        track_id: spotifyTrack.id,
        videos: (discogsRelease.videos || [])
            .filter(video => video.title.includes(spotifyTrack.name))
            .map(video => ({
                embed: video.embed,
                uri: video.uri,
                duration: secsToTime(video.duration)
            })),
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
    title: spotifyAlbum.name,
    artist: spotifyAlbum.artists[0].name,
    duration: millisToTime(spotifyAlbum.tracks.items.map(track => track.duration_ms).reduce((a, b) => a + b, 0)),
    spotify: {
        album_id: spotifyAlbum.id,
        images: spotifyAlbum.images
    },
    discogs: {
        release_id: discogsRelease.id,
        images: discogsRelease.images
    },
    tracks: spotifyAlbum.tracks.items.map(buildSong(discogsRelease))
});