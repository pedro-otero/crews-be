const matchers = [

    // credits
    (album, release) => release.tracklist.reduce(
        (score, track) => score + (track.extraartists ? track.extraartists : []).reduce(
            (trackScore, extraArtist) => trackScore + 1, 0), 0),

    // correctness
    (album, release) => release.data_quality === 'Correct',

];

const getScore = (album, release) => matchers.reduce((accum, matcher) => matcher(album, release) ? accum + 1 : accum, 0);

module.exports = function (album, releases) {
    if (releases.length == 1) return releases[0];
    const scores = releases.map(release => getScore(album, release));
    return releases[scores.indexOf(Math.max(...scores))];
};