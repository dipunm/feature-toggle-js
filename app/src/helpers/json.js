const { createSimpleToggles } = require('./core');

module.exports.fromJSON = (json) => {
  const features = Object.keys(json.values).map(name => ({
    name,
    test: () => json[name],
  }));
  return createSimpleToggles(features);
};

module.exports.createToJSON = (get, features) => {
  const featureNames = features.map(f => f.name);
  return (whitelist = []) => {
    let filter;
    if (Array.isArray(whitelist)) {
      if (whitelist.length > 0) {
        filter = e => filter.indexOf(e) > -1;
      } else {
        filter = () => true;
      }
    } else if (typeof whitelist === 'function') {
      filter = whitelist;
    } else {
      throw new Error(
        `Unsupported whitelist parameter of type ${typeof whitelist}`,
      );
    }

    return {
      values: featureNames.filter(name => filter(name)).reduce((json, name) => {
        json[name] = get(name);
        return json;
      }, {}),
    };
  };
};
