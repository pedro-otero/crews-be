const mockState = require('./mock-state');

before('Test globals', function () {
  this.store = {
    getState: () => mockState,
  };
});
