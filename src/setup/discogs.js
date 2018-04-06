const Throxy = require('throxy');
const Disconnect = require('disconnect');

const Search = require('../discogs');
const disconnectConfig = require('../../disconnect-config.json');

const disconnect = new Disconnect.Client(disconnectConfig.agent, disconnectConfig.keys);
const throxy = new Throxy(disconnect.database(), 1100);

module.exports = new Search(throxy);
