const express = require('express');
const request = require('supertest');

const route = require('./index');

describe('Albums endpoint', () => {
  beforeEach(function () {
    const app = express();
    app.use(route);
    this.request = request(app);
  });

  it('returns 200', function () {
    this.request
      .get('/1')
      .expect(200);
  });
});
