const accents = require('remove-accents');

const { ADD_CREDITS } = require('../action/constants');

module.exports = (state = [], { type, credits }) => {
  switch (type) {
    case ADD_CREDITS:
      const unique = credits.filter(({ name, role, track }) =>
        !state.find(s => s.name === name && s.role === role && s.track === track));
      const merged = [...unique, ...state];
      return merged.reduce((filtered, current) => {
        if (accents.has(current.name)) {
          const index = filtered.findIndex(f => f.name === accents.remove(current.name));
          if (index > -1) {
            return [current, ...filtered.filter((_, i) => i !== index)];
          }
        } else {
          const index = filtered.findIndex(f => accents.remove(f.name) === current.name);
          if (index === -1) {
            return [current, ...filtered];
          }
          return filtered;
        }
        return [current, ...filtered];
      }, []);
    default:
      return state;
  }
};
