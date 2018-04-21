const mockState = require('./mock-state');

before('Test globals', function () {
  this.store = {
    getState: () => mockState,
  };
  this.mockStore = state => ({ getState: () => state });
});
