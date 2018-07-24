const { createSimpleToggles } = require('./helpers/core');
// This is a smaller bundle used when toggles are created
// and managed server side, but we want to continue using
// them on the client side.

// fromJSON
// get
// values

module.exports.fromJSON = (json) => {
  const features = Object.keys(json.values).map(name => ({
    name,
    test: () => json[name],
  }));
  return createSimpleToggles(features);
};
