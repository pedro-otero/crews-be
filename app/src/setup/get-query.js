const { store } = require('../redux/state');
const Query = require('../redux/view/query');

module.exports = Query(store);
