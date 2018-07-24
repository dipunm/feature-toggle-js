let healthCallback;
module.exports.onHealthAlert = (fn) => {
  healthCallback = fn;
};
module.exports.runHealthCheck = (features) => {
  if (healthCallback) {
    features
      .map((f) => {
        const { name } = f;
        const alert = f.health ? f.health() : null;
        return { name, alert };
      })
      .filter(({ alert }) => !!alert)
      .forEach(({ name, alert }) => {
        healthCallback(name, alert);
      });
  }
};
