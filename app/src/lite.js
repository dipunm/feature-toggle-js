const { createSimpleToggles } = require('./helpers/core');

module.exports.fromJSON = (json) => {
  const features = Object.keys(json.values).map(name => ({
    name,
    test: () => json.values[name],
  }));
  return createSimpleToggles(features);
};
