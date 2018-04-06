const fs = require('fs');
const path = require('path');
const tests = fs.readdirSync('./routes/album/tests/').map(dir => ({
    album: require(path.join(__dirname, 'tests', dir, 'album.json')),
    release: require(path.join(__dirname, 'tests', dir, 'release.json')),
    expected: require(path.join(__dirname, 'tests', dir, 'expected.json'))
}));

const app = require('../../app');
const http = require('http');
const superagent = require('superagent');
const expect = require('expect.js');

describe('Albums endpoint', function () {

    let server;
    const port = process.env.PORT || 3000;

    before(function (done) {
        app.locals.spotifyApi = Promise.resolve({
            getAlbum: (id) => Promise.resolve(tests.reduce((albums, t) => {
                albums[t.album.id] = {body: t.album};
                return albums;
            }, {})[id])
        });
        app.locals.discogs = {
            findReleases: (album) => Promise.resolve(tests.reduce((releases, t) => {
                releases[t.album.id] = [t.release];
                return releases;
            }, {})[album.id])
        }
        server = http.createServer(app);
        server.listen(port, function () {
            console.log('Express server in test listening on port ' + port);
            done();
        });
    });

    tests.forEach(t => {

        const album = t.album;
        const release = t.release;
        const expected = t.expected;

        it(`"${album.artists[0].name} - ${album.name}"`, function (done) {

            superagent
                .get(`http://localhost:${port}/data/album/${album.id}`)
                .end(function (res) {
                    expect(res.status).to.equal(200);
                    const actual = res.body;
                    expect(actual.title).to.equal(expected.title);
                    expect(actual.artist).to.equal(expected.artist);
                    expect(actual.duration).to.equal(expected.duration);
                    expect(actual.spotify.album_id).to.equal(expected.spotify.album_id);
                    actual.tracks
                        .map((track, i) => ({actual: track, expected: expected.tracks[i]}))
                        .forEach((set, i) => {
                            expect(set.actual.title).to.equal(set.expected.title);
                            expect(set.actual.duration).to.equal(set.expected.duration);
                            set.actual.producers.forEach(producer => expect(set.expected.producers).to.contain(producer));
                            set.actual.composers.forEach(composer => expect(set.expected.composers).to.contain(composer));
                            set.actual.featured.forEach(feat => expect(set.expected.featured).to.contain(feat));
                            Object.keys(set.actual.credits).forEach(name => {
                                expect(Object.keys(set.expected.credits)).to.contain(name);
                                set.actual.credits[name].forEach(credit => expect(set.expected.credits[name]).to.contain(credit));
                            });
                        });
                    done();
                });

        });
    });

    after(function () {
        server.close();
        console.log('Express server in test has been shut down');
    });
});
