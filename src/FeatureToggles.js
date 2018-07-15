const ERR_TOGGLE_NOT_DEFINED = name => `Unable to find feature toggle '${name}'.s Please ensure that the feature name is spelled correctly.`;
const ERR_DEPENDENCY_ALREADY_DEFINED = name => `Cannot define dependency ${name}: dependency has already been defined.`;
const ERR_DEPENDENCY_NOT_DEFINED = (name, dependency) =>> `Unable to get feature toggle ${name}: dependency not defined: '${dependency}'`;

class FeatureToggles {
    constructor(features) {
        this.features = features;
        this.cache = {};
        this.dependencies = [];
        runHealthCheck(features);
        provideResets(features, this.cache);
    }

    defineDependency(dependencyName, dependency) {
        if(dependencyName in this.dependencies) {
            throw new Error(ERR_DEPENDENCY_ALREADY_DEFINED);
        }

        this.dependencies[dependencyName] = dependency;
    }

    get(featureName) {
        if(!this.cache[featureName]) {           
            const feature = this.features.find(f => f.name === featureName);
            if (!feature) {
                throw Error(ERR_TOGGLE_NOT_DEFINED(featureName));
            }
            const dependencyNames = feature.dependencies || [];
            const dependencies = dependencyNames.map(dependencyName => {
                if (dependencyName in this.dependencies) {
                    return this.dependencies[l];
                }
                throw new Error(ERR_DEPENDENCY_NOT_DEFINED(featureName, dependencyName));
            });
            this.cache[featureName] = !!feature.test(...dependencies);
        }
        return this.cache[featureName];
    }

    toJSON(whitelist = []) {
        let filter;
        if(typeof whitelist === 'array') {
            if (whitelist.length > 0) {
                filter = (e) => filter.indexOf(e) > -1;
            } else {
                filter = () => true;
            }
        } else if (typeof whitelist === 'function') {
            filter = whitelist;
        } else{
            throw new Error();
        }

        return this.features
            .filter(f => whitelist(f.name))
            .reduce((json, f) => ({
                ...json, 
                [f.name]: this.get(f.name)
            }),{});
    }
}

let healthCallback;
function onHealthAlert(fn) {
    healthCallback = fn;
}
function runHealthCheck(features) {
    if(healthCallback) {
        features.map(f => {
            const name = f.name;
            const alert = f.health ? f.health() : null;
            return {name, alert};
        })
        .filter(({alert}) => alert === null)
        .forEach(({name, alert}) => {
            healthCallback(name, alert);
        });
    }
}

function provideResets(features, cache) {
    features.forEach(f => {
        if(typeof features.resetOn === 'function') {
            const reset = () => {
                delete cache[f.name]; 
            };
            f.resetOn(reset);
        }
    });
}

const arrayAccessor = {
    get: function(target, prop) {
        if(!target[prop]) {
            target.get(prop);
        }
        return target[prop];
    }
}
modules.export.create = (...args) => new Proxy(
    new FeatureToggles(...args),
    arrayAccessor
);

modules.export.fromJSON = (json) => {
    const features = Object.keys(json)
        .map(name => ({
            name,
            test: () => json[name]
        }))
}
modules.export.onHealthAlert = onHealthAlert;