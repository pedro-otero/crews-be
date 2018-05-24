const accents = require('remove-accents');

const hasAccentedName = c => accents.has(c.name);

module.exports = (state = [], credits) => credits
  .filter(c => !hasAccentedName(c))
  .concat(state.filter(c => !hasAccentedName(c)))
  .reduce((all, current) => {
    if (all.find(item =>
      accents.remove(item.name) === current.name &&
            item.role === current.role &&
            item.track === current.track)) {
      return all;
    }
    return all.concat([current]);
  }, credits
    .filter(hasAccentedName)
    .concat(state.filter(hasAccentedName)))
  .reduce((all, current) => {
    if (all.find(item =>
      item.name === current.name &&
              item.role === current.role &&
              item.track === current.track)) {
      return all;
    }
    return all.concat([current]);
  }, []);
