const sinon = require('sinon');
const assert = require('assert');

const Discogs = require('./discogs.js');
const mocks = require('./discogs.json');

const {
  results: [firstResults, secondResults],
  album,
  releases: [r1, r2],
} = mocks;

describe('Find releases function', () => {
  describe('calls the db and actions functions', () => {
    before(function (done) {
      this.values = [];
      this.db = {
        search: sinon.stub()
          .onCall(0).resolves(firstResults)
          .onCall(1)
          .resolves(secondResults),
        getRelease: sinon.stub()
          .onCall(0).resolves(r1)
          .onCall(1)
          .resolves(r2),
      };
      this.discogs = Discogs(this.db);
      this.discogs
        .findReleases(album)
        .subscribe(this.values.push.bind(this.values), () => assert(false), done);
    });

    describe('searches 1st page with correct', () => {
      before(function () {
        this.args = this.db.search.getCalls()[0].args[0];
      });

      it('artist', function () {
        assert.equal(this.args.artist, 'Artist');
      });

      it('release_title', function () {
        assert.equal(this.args.release_title, 'Album');
      });

      it('type', function () {
        assert.equal(this.args.type, 'release');
      });

      it('per_page', function () {
        assert.equal(this.args.per_page, 100);
      });

      it('page', function () {
        assert.equal(this.args.page, 1);
      });
    });

    it('emits first page of results', function () {
      assert.deepEqual(this.values[0].data.page, firstResults);
    });

    describe('searches 2nd page with correct', () => {
      before(function () {
        this.args = this.db.search.getCalls()[1].args[0];
      });

      it('artist', function () {
        assert.equal(this.args.artist, 'Artist');
      });

      it('release_title', function () {
        assert.equal(this.args.release_title, 'Album');
      });

      it('type', function () {
        assert.equal(this.args.type, 'release');
      });

      it('per_page', function () {
        assert.equal(this.args.per_page, 100);
      });

      it('page', function () {
        assert.equal(this.args.page, 2);
      });
    });

    it('emits second page of results', function () {
      assert.deepEqual(this.values[2].data.page, secondResults);
    });

    it('gets release 1', function () {
      assert(this.db.getRelease.calledWith(1));
    });

    it('emits release 1', function () {
      assert.equal(this.values[1].data.release.id, 1);
    });

    it('gets release 2', function () {
      assert(this.db.getRelease.calledWith(2));
    });

    it('emits release 2', function () {
      assert.equal(this.values[3].data.release.id, 2);
    });
  });

  describe('fails to search', () => {
    before(function (done) {
      this.errors = [];
      this.db = {
        search: sinon.stub()
          .onCall(0).rejects('ERROR'),
      };
      this.discogs = Discogs(this.db);
      this.discogs
        .findReleases(album)
        .subscribe(() => assert(false), (error) => {
          this.errors.push(error);
          done();
        }, () => assert(false));
    });

    it('Emits error message', function () {
      assert.equal(this.errors[0], 'ERROR');
    });
  });
});
