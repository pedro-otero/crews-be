const Throxy = require('throxy');
const Disconnect = require('disconnect');

const DiscogsFinder = require('../search/discogs');
const disconnectConfig = require('../../disconnect-config.json');

const disconnect = new Disconnect.Client(disconnectConfig.agent, disconnectConfig.keys);
const throttledDatabase = new Throxy(disconnect.database(), 1100);

module.exports = new DiscogsFinder(throttledDatabase);
