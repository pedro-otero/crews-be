const Throxy = require('throxy');
const Disconnect = require('disconnect');

const { agent, keys } = require('../../../disconnect-config.json');

const disconnect = new Disconnect.Client(agent, keys);
const throttledDatabase = new Throxy(disconnect.database(), 1100);

module.exports = { db: throttledDatabase, PAUSE_NEEDED_AFTER_429: 30000 };
