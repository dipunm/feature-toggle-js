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
