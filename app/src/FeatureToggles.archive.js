const ERR_TOGGLE_NOT_DEFINED = name => `Unable to find feature toggle '${name}'. Please ensure that the feature name is spelled correctly.`;
const ERR_DEPENDENCY_ALREADY_DEFINED = name => `Cannot define dependency '${name}': dependency has already been defined.`;
const ERR_DEPENDENCY_NOT_DEFINED = (name, dependency) => `Unable to get feature toggle ${name}: dependency not defined: '${dependency}'`;
const ERR_UNEXPECTED_DEPENDENCIES_REQUIRED = dependencies => `Unexpected dependencies found in toggles: '${dependencies.join("', '")}'`;
const ERR_UNEXPECTED_DEPENDENCY_DEFINED = dependency => `An unexpected dependency was defined: '${dependency}'`;

let expectedDependencies = null;
function setExpectedDependencies(dependencies) {
  expectedDependencies = dependencies;
}

let healthCallback;
function onHealthAlert(fn) {
  healthCallback = fn;
}
function runHealthCheck(features) {
  if (healthCallback) {
    features
      .map((f) => {
        const { name } = f;
        const alert = f.health ? f.health() : null;
        return { name, alert };
      })
      .filter(({ alert }) => alert !== null)
      .forEach(({ name, alert }) => {
        healthCallback(name, alert);
      });
  }
}

function provideResets(features, valueCache) {
  features.forEach((f) => {
    if (typeof features.resetOn === 'function') {
      const reset = () => {
        delete valueCache[f.name];
      };
      f.resetOn(reset);
    }
  });
}

class FeatureToggles {
  constructor(features) {
    this.features = features;
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
    this.cache = {};
    this.dependencies = {};
    runHealthCheck(features);
    provideResets(features, this.cache);
    this.values = new Proxy(
      {},
      {
        get: (target, prop) => this.get(prop),
      },
    );
  }

  defineDependency(dependencyName, dependency) {
    if (dependencyName in this.dependencies) {
      throw new Error(ERR_DEPENDENCY_ALREADY_DEFINED(dependencyName));
    }

    if (
      expectedDependencies
      && expectedDependencies.indexOf(dependencyName) === -1
    ) {
      throw new Error(ERR_UNEXPECTED_DEPENDENCY_DEFINED(dependencyName));
    }

    this.dependencies[dependencyName] = dependency;
  }

  get(featureName) {
    if (!this.cache[featureName]) {
      const feature = this.features.find(f => f.name === featureName);
      if (!feature) {
        throw new Error(ERR_TOGGLE_NOT_DEFINED(featureName));
      }
      const dependencyNames = feature.dependencies || [];
      const dependencies = dependencyNames.map((dependencyName) => {
        if (dependencyName in this.dependencies) {
          return this.dependencies[dependencyName];
        }
        throw new Error(
          ERR_DEPENDENCY_NOT_DEFINED(featureName, dependencyName),
        );
      });
      this.cache[featureName] = !!feature.test(...dependencies);
    }
    return this.cache[featureName];
  }

  toJSON(whitelist = []) {
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
      values: this.features.filter(f => filter(f.name)).reduce(
        (json, f) => ({
          ...json,
          [f.name]: this.get(f.name),
        }),
        {},
      ),
    };
  }
}

module.exports.create = features => new FeatureToggles(features);
module.exports.fromJSON = (json) => {
  const features = Object.keys(json.values).map(name => ({
    name,
    test: () => json[name],
  }));
  return new FeatureToggles(features);
};
module.exports.onHealthAlert = onHealthAlert;
module.exports.setExpectedDependencies = setExpectedDependencies;
