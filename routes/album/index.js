const express = require('express');
const router = express.Router();

const apputils = {

    millisToTime: millis => {
        const seconds = millis / 1000;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    },

    secsToTime: seconds => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

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
        duration: apputils.millisToTime(spotifyTrack.duration_ms),
        track_id: spotifyTrack.id,
        videos: (discogsRelease.videos || [])
            .filter(video => video.title.includes(spotifyTrack.name))
            .map(video => ({
                embed: video.embed,
                uri: video.uri,
                duration: apputils.secsToTime(video.duration)
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

const buildAlbum = (spotifyAlbum, discogsRelease) => ({
    title: spotifyAlbum.name,
    artist: spotifyAlbum.artists[0].name,
    duration: apputils.millisToTime(spotifyAlbum.tracks.items.map(track => track.duration_ms).reduce((a, b) => a + b, 0)),
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

const matchers = [
    // credits
    (album, release) => release.tracklist.reduce(
        (score, track) => score + (track.extraartists ? track.extraartists : []).reduce(
            (trackScore, extraArtist) => trackScore + 1, 0), 0),

// correctness
    (album, release) => release.data_quality === 'Correct',
];

const getScore = (album, release) => matchers.reduce((accum, matcher) => matcher(album, release) ? accum + 1 : accum, 0);

const matchAlbum = function (album, releases) {

    if (releases.length == 1) return releases[0];
    const scores = releases.map(release => getScore(album, release));
    return releases[scores.indexOf(Math.max(...scores))];
};

router.get('/:spotifyAlbumId', function (req, res) {

    const discogify = req.app.locals.discogify;
    const spotifyApi = req.app.locals.spotifyApi;

    return spotifyApi.then(api => api.getAlbum(req.params.spotifyAlbumId).then(function (response) {
        const album = response.body;
        discogify.findReleases(album).then(releases => {
            const release = matchAlbum(album, releases);
            const builtAlbum = buildAlbum(album, release);
            res.json(builtAlbum);
        });
    }).catch(e => res.status(500).send(e.stack)));
});

module.exports = router;