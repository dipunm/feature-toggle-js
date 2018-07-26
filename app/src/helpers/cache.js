module.exports.provideResets = (features, cache) => {
  features.forEach((f) => {
    if (typeof f.resetOn === 'function') {
      const reset = () => {
        delete cache[f.name];
      };
      f.resetOn(reset);
    }
  });
};

module.exports.withCache = valueCache => fn => (featureName) => {
  if (!Object.prototype.hasOwnProperty.call(valueCache, featureName)) {
    valueCache[featureName] = fn(featureName);
  }
  return valueCache[featureName];
};
