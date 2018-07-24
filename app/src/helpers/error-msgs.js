module.exports.ERR_TOGGLE_NOT_DEFINED = name => `Unable to find feature toggle '${name}'. Please ensure that the feature name is spelled correctly.`;
module.exports.ERR_DEPENDENCY_ALREADY_DEFINED = name => `Cannot define dependency '${name}': dependency has already been defined.`;
module.exports.ERR_DEPENDENCY_NOT_DEFINED = (name, dependency) => `Unable to get feature toggle ${name}: dependency not defined: '${dependency}'`;
module.exports.ERR_UNEXPECTED_DEPENDENCIES_REQUIRED = dependencies => `Unexpected dependencies found in toggles: '${dependencies.join("', '")}'`;
module.exports.ERR_UNEXPECTED_DEPENDENCY_DEFINED = dependency => `An unexpected dependency was defined: '${dependency}'`;
