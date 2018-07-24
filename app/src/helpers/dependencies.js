const {
  ERR_DEPENDENCY_NOT_DEFINED,
  ERR_DEPENDENCY_ALREADY_DEFINED,
  ERR_UNEXPECTED_DEPENDENCY_DEFINED,
  ERR_UNEXPECTED_DEPENDENCIES_REQUIRED,
} = require('./error-msgs');

let expectedDependencies = null;
module.exports.setExpectedDependencies = (dependencies) => {
  if (Array.isArray(dependencies)) {
    expectedDependencies = dependencies;
  } else {
    expectedDependencies = null;
  }
};

module.exports.dependencyGetter = dependencyCache => (
  featureName,
  dependencyNames,
) => dependencyNames.map((dependencyName) => {
  if (dependencyName in dependencyCache) {
    return dependencyCache[dependencyName];
  }
  throw new Error(ERR_DEPENDENCY_NOT_DEFINED(featureName, dependencyName));
});

module.exports.dependencySetter = dependencyCache => (
  dependencyName,
  dependency,
) => {
  if (dependencyName in dependencyCache) {
    throw new Error(ERR_DEPENDENCY_ALREADY_DEFINED(dependencyName));
  }

  if (
    expectedDependencies
    && expectedDependencies.indexOf(dependencyName) === -1
  ) {
    throw new Error(ERR_UNEXPECTED_DEPENDENCY_DEFINED(dependencyName));
  }

  dependencyCache[dependencyName] = dependency;
};

module.exports.assertDependencies = (features) => {
  if (expectedDependencies) {
    const allDependencies = features.reduce(
      (deps, f) => [...deps, ...(f.dependencies || [])],
      [],
    );
    const unexpected = allDependencies.filter(
      d => expectedDependencies.indexOf(d) === -1,
    );
    if (unexpected.length) {
      throw new Error(ERR_UNEXPECTED_DEPENDENCIES_REQUIRED(unexpected));
    }
  }
};
