const expect = require('expect.js');
const match = require('./match');

describe('Match', function () {

    before(function () {
        this.album = {};
        this.releases = [{
            id: 1,
            tracklist: [{
                extraartists: [
                    {}, {}, {}
                ]
            }]
        }];
        this.match = match(this.album, this.releases);
    });

    it('matches correct album agains a list of releases', function () {
        expect(this.match.id).to.equal(1);
    });
});