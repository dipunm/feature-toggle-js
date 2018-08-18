describe('defining a dependency on a new toggles instance', () => {
  const features = [
    {
      name: 'unimportant',
      test: () => true,
    },
  ];
  const dependency = {};
  let FeatureToggles;
  beforeEach(() => {
    jest.resetModules();
    FeatureToggles = require('../server'); // eslint-disable-line global-require
  });

  it('should not throw any errors', () => {
    const toggles = FeatureToggles.create(features);
    expect(() => toggles.defineDependency('dependency1', dependency)).not.toThrow();
  });

  describe('after setting the expected dependencies to nothing', () => {
    beforeEach(() => {
      FeatureToggles.setExpectedDependencies(null);
    });

    it('should not throw any errors', () => {
      const toggles = FeatureToggles.create(features);
      expect(() => toggles.defineDependency('dependency1', dependency)).not.toThrow();
    });
  });

  describe('after setting the expected dependencies to an empty array', () => {
    beforeEach(() => {
      FeatureToggles.setExpectedDependencies([]);
    });

    it('should throw explaining that it is an unexpected dependency', () => {
      const toggles = FeatureToggles.create(features);
      expect(() => toggles.defineDependency('dependency1', dependency)).toThrowErrorMatchingSnapshot();
    });
  });

  describe('that was unexpected after setting the expected dependencies', () => {
    beforeEach(() => {
      FeatureToggles.setExpectedDependencies(['somedependency']);
    });

    it('should throw explaining that it is an unexpected dependency', () => {
      const toggles = FeatureToggles.create(features);
      expect(() => toggles.defineDependency('dependency1', dependency)).toThrowErrorMatchingSnapshot();
    });
  });

  describe('that was expected after setting the expected dependencies', () => {
    beforeEach(() => {
      FeatureToggles.setExpectedDependencies(['dependency1']);
    });

    it('should throw explaining that it is an unexpected dependency', () => {
      const toggles = FeatureToggles.create(features);
      expect(() => toggles.defineDependency('dependency1', dependency)).not.toThrow();
    });
  });

  describe('a second time', () => {
    let toggles;
    beforeEach(() => {
      toggles = FeatureToggles.create(features);
      toggles.defineDependency('dependency1', {});
    });

    it('should throw explaining that it was already defined', () => {
      expect(() => toggles.defineDependency('dependency1', dependency)).toThrowErrorMatchingSnapshot();
    });
  });
});

describe('evaluating a toggle', () => {
  describe('with no dependencies', () => {});
  describe('with an undefined dependency', () => {});
  describe('with multiple undefined dependencies', () => {});
});

describe('creating a toggles instance after setting expected dependencies', () => {
  describe('with a feature that requires an unexpected dependency', () => {});
});
