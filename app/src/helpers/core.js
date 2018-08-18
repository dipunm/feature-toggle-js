const ERR_TOGGLE_NOT_DEFINED = require('./error-msgs/ERR_TOGGLE_NOT_DEFINED');

function getFeatureValue(features, dependencyGetter) {
  return (featureName) => {
    const getDependencies = dependencyGetter || (() => []);
    const feature = features.find(f => f.name === featureName);
    if (!feature) {
      throw new Error(ERR_TOGGLE_NOT_DEFINED(featureName));
    }
    const dependencies = getDependencies(
      feature.name,
      feature.dependencies || [],
    );
    return !!feature.test(...dependencies);
  };
}

function proxy(getVal) {
  return new Proxy(
    {},
    {
      get: (target, prop) => getVal(prop),
    },
  );
}

function createToggles(
  features,
  {
    withCache, getDependencies, defineDependency, createToJSON,
  },
) {
  const get = withCache
    ? withCache(getFeatureValue(features, getDependencies))
    : getFeatureValue(features, getDependencies);

  const toggles = {
    get,
    values: proxy(get),
  };

  if (defineDependency) {
    toggles.defineDependency = defineDependency;
  }

  if (createToJSON) {
    toggles.toJSON = createToJSON(toggles.get, features);
  }

  return toggles;
}

module.exports.createToggles = createToggles;
module.exports.createSimpleToggles = features => createToggles(features, {});
