module.exports = (results, { name, artists: [{ name: artist }] }) => {
  return results.reduce((ordered, release) => {
    const exactTitle = `${artist} - ${name}`;
    if (exactTitle === release.title) {
      return [release].concat(ordered);
    } else {
      return ordered.concat([release]);
    }
  });
};