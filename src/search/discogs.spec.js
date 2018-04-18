const sinon = require('sinon');
const assert = require('assert');

const Discogs = require('./discogs.js');
const mocks = require('./discogs.json');

const {
  results: [firstResults, secondResults],
  album,
  releases,
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
        getRelease: sinon.spy(wantedId => releases.find(({ id }) => id === wantedId)),
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

    describe('emits pages of results', () => {
      before(function () {
        this.results = this.values.filter(v => v.type === 'results');
      });

      it('first', function () {
        assert.deepEqual(this.results[0].data.page, firstResults);
      });

      it('second', function () {
        assert.deepEqual(this.results[1].data.page, secondResults);
      });
    });

    describe('emits releases', () => {
      before(function () {
        this.releases = this.values.filter(v => v.type === 'release');
      });

      it('4', function () {
        assert.equal(this.releases[0].data.release.id, 4);
      });

      it('1', function () {
        assert.equal(this.releases[1].data.release.id, 1);
      });

      it('2', function () {
        assert.equal(this.releases[2].data.release.id, 2);
      });

      it('3', function () {
        assert.equal(this.releases[3].data.release.id, 3);
      });
    });

    describe('gets releases', () => {
      it('1', function () {
        assert(this.db.getRelease.calledWith(1));
      });

      it('2', function () {
        assert(this.db.getRelease.calledWith(2));
      });

      it('3', function () {
        assert(this.db.getRelease.calledWith(3));
      });

      it('4', function () {
        assert(this.db.getRelease.calledWith(4));
      });

      it('4', function () {
        assert.equal(this.db.getRelease.getCalls().length, 4);
      });
    });

    describe('gets releases in correct order', () => {
      it('1st: [id=4]', function () {
        assert.equal(this.db.getRelease.getCalls()[0].args[0], 4);
      });

      it('2nd: [id=1]', function () {
        assert.equal(this.db.getRelease.getCalls()[1].args[0], 1);
      });

      it('3rd: [id=2]', function () {
        assert.equal(this.db.getRelease.getCalls()[2].args[0], 2);
      });

      it('4th: [id=3]', function () {
        assert.equal(this.db.getRelease.getCalls()[3].args[0], 3);
      });
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

  describe('fails to get release', () => {
    before(function (done) {
      this.errors = [];
      this.db = {
        search: sinon.stub()
          .onCall(0).resolves(firstResults)
          .onCall(1)
          .resolves(secondResults),
        getRelease: sinon.stub().rejects('ERROR'),
      };
      this.discogs = Discogs(this.db);
      this.discogs
        .findReleases(album)
        .subscribe(() => {}, (error) => {
          this.errors.push(error);
          done();
        }, () => assert(false));
    });

    it('Emits error message', function () {
      assert.equal(this.errors[0], 'ERROR');
    });

    it('Does not search next page', function () {
      assert.equal(this.args = this.db.search.getCalls().length, 1);
    });
  });
});
