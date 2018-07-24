const { createToggles } = require('./helpers/core');
const { runHealthCheck, onHealthAlert } = require('./helpers/health');
const { provideResets } = require('./helpers/cache');
const {
  setExpectedDependencies,
  dependencyGetter,
  dependencySetter,
  assertDependencies,
} = require('./helpers/dependencies');
const { createToJSON } = require('./helpers/json');
const assertArgs = require('./helpers/fail-fast');

module.exports.create = (features) => {
  assertArgs(features);
  assertDependencies(features);
  runHealthCheck(features);

  const cache = {};
  provideResets(features, cache);

  const dependencies = {};
  const toggles = createToggles(features, {
    getDependencies: dependencyGetter(dependencies),
    defineDependency: dependencySetter(dependencies),
    createToJSON,
  });
  return toggles;
};

module.exports.onHealthAlert = onHealthAlert;
module.exports.setExpectedDependencies = setExpectedDependencies;
