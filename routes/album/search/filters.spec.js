const assert = require('assert');
const match = require('./filters');

describe('Filter by', () => {

    it('title', () => {
        assert.deepEqual(match(
            // ALBUM
            {name: 'Album'},

            // COLLECTION
            [
                {id: 1, title: 'Artist - Album'},
                {id: 2, title: 'Artist - Some other album'},
                {id: 3, title: 'The Artist - Album'}
            ]

            // FILTERS
        ).by('title'),
            [{ match: true }, { match: false }, { match: true }]);
    });

    it('exact title', () => {
        assert.deepEqual(match(
            // ALBUM
            {name: 'Album', artists: [{name: 'ARTIST'}]},

            // COLLECTION
            [
                {id: 1, title: 'Artist - Album'},
                {id: 2, title: 'Artist - Some other album'},
                {id: 3, title: 'The Artist - Album'}
            ]

            // FILTERS
        ).by('exact title'), [{ match: true }, { match: false }, { match: false }]);
    });

    describe('format', () => {

        it('as array', () => {
            assert.deepEqual(match(
                // ALBUM
                {album_type: 'album'},

                // COLLECTION
                [
                    {id: 1, format: ['LP']},
                    {id: 2, format: ['album']},
                    {id: 3, format: ['cassette']}
                ]

                // FILTERS
            ).by('format'), [{ match: false }, { match: true }, { match: false }]);
        });

        it('as string', () => {
            assert.deepEqual(match(
                // ALBUM
                {album_type: 'album'},

                // COLLECTION
                [
                    {id: 1, format: 'LP'},
                    {id: 2, format: 'album'},
                    {id: 3, format: 'album, cassette'}
                ]

                // FILTERS
            ).by('format'), [{ match: false }, { match: true }, { match: true }]);
        });

    });

    describe('year', () => {

        it('only year in release_date', () => {
            assert.deepEqual(match(
                // ALBUM
                {release_date: '2012'},

                // COLLECTION
                [
                    {id: 1, year: '2011'},
                    {id: 2, year: '2012'},
                    {id: 3, year: '2013'}
                ]

                // FILTERS
            ).by('year'), [{ match: false }, { match: true }, { match: false }]);
        });

        it('full date in release_date', () => {
            assert.deepEqual(match(
                // ALBUM
                {release_date: '2012-04-25'},

                // COLLECTION
                [
                    {id: 1, year: '2011'},
                    {id: 2, year: '2012'},
                    {id: 3, year: '2013'}
                ]

                // FILTERS
            ).by('year'), [{ match: false }, { match: true }, { match: false }]);
        });

    });

    it('tracklist', () => {
        assert.deepEqual(match(
            // ALBUM
            {
                tracks: {
                    items: [
                        {name: 'TRACK #1'},
                        {name: 'TRACK #2 - INTERLUDE'},
                        {name: 'TRACK #3 (NAME IN PARENTHESES)'},
                        {name: '(PRECEDING PARENTHESIS) TRACK #4'},
                        {name: "TRACK #5 (Stuff that's not in the release)"},
                        {name: "TRACK #6 - Stuff that's not in the release"},
                        {name: 'TRACK #7'},
                        {name: 'TRACK #8'}
                    ]
                }
            },

            // COLLECTION
            [
                {
                    id: 1, tracklist: [
                        {title: 'Track #1'},
                        {title: 'track #2 (Interlude)'},
                        {title: 'track #3 - Name in parentheses'},
                        {title: '(Preceding parenthesis) track #4'},
                        {title: 'track #5'},
                        {title: 'track #6'},
                        {title: "track #7 (Stuff that's not in the release)"},
                        {title: "track #8 - Stuff that's not in the release"}
                    ]
                }
            ]

            // FILTERS
        ).by('tracklist'), [{ match: true }]);
    });

    it('release date', () => {
        assert.deepEqual(match(
            // ALBUM
            {release_date: '2012-04-25'},

            // COLLECTION
            [
                {id: 1, released: '2011'},
                {id: 2, released: '2012-04-25'},
                {id: 3, released: '2013'}
            ]

            // FILTERS
        ).by('release date'), [{ match: false }, { match: true }, { match: false }]);
    });

});