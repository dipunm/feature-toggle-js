const { ERR_TOGGLE_NOT_DEFINED } = require('./error-msgs');

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

module.exports.createSimpleToggles = features => module.exports.createtoggles(features, {});

module.exports.createToggles = (
  features,
  { getDependencies, defineDependency, createToJSON },
) => {
  const get = getFeatureValue(features, getDependencies);
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
};
