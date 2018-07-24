const sinon = require('sinon');

describe('creating feature toggles', () => {
  let FeatureToggles;
  const features = {
    Healthy: { name: 'featureHealthy', test: () => true, health: null },
    Unhealthy: { name: 'featureUnhealthy', test: () => true, health: null },
    WithResetFn: {
      name: 'featureWithResetFn',
      resetOn: null,
      test: () => true,
    },
    WithDependencies: {
      name: 'featureWithDependencies',
      dependencies: ['lang'],
      test: lang => true, // eslint-disable-line no-unused-vars
    },
    WithUnexpectedDependencies: {
      name: 'featureWithUnexpected',
      dependencies: ['blah'],
      test: blah => true, // eslint-disable-line no-unused-vars
    },
  };

  beforeEach(() => {
    jest.resetModules();

    features.Healthy.health = sinon.fake();
    features.Unhealthy.health = sinon.fake.returns('out of date.');
    features.WithResetFn.resetOn = sinon.fake();

    FeatureToggles = require('../server'); // eslint-disable-line global-require
  });

  const allFeatures = Object.values(features);

  describe('without any pre-setup', () => {
    test('should provide a toggles object without errors', () => {
      let toggles;
      expect(() => {
        toggles = FeatureToggles.create(allFeatures);
      }).not.toThrow();
      expect(toggles).not.toBeFalsy();
    });

    test('should not call the health functions', () => {
      FeatureToggles.create([features.Unhealthy]);
      sinon.assert.notCalled(features.Unhealthy.health);
    });

    test('should provide a the reset functions to the reset handlers', () => {
      FeatureToggles.create([features.WithResetFn]);
      sinon.assert.called(features.WithResetFn.resetOn);
    });
  });

  describe('after declaring a health alert handler', () => {
    const handler = sinon.spy();
    beforeEach(() => {
      handler.resetHistory();
      FeatureToggles.onHealthAlert(handler);
    });

    describe('when creating unhealthy toggles', () => {
      beforeEach(() => {
        FeatureToggles.create([features.Unhealthy]);
      });

      test('the health alert handler should be called with the health message', () => {
        sinon.assert.calledWith(handler, 'featureUnhealthy', 'out of date.');
      });
    });

    describe('when creating healthy toggles', () => {
      beforeEach(() => {
        FeatureToggles.create([features.Healthy]);
      });

      test('the health alert handler should not be called', () => {
        sinon.assert.notCalled(handler);
      });
    });
  });

  describe('after declaring the expected dependencies', () => {
    beforeEach(() => {
      FeatureToggles.setExpectedDependencies(['lang']);
    });

    test('given expected dependencies, should provide a toggles object without errors', () => {
      let toggles;
      expect(() => {
        toggles = FeatureToggles.create([features.WithDependencies]);
      }).not.toThrow();
      expect(toggles).toBeTruthy();
    });

    test('given unexpected dependencies, should throw an error', () => {
      expect(() => FeatureToggles.create([features.WithUnexpectedDependencies])).toThrowErrorMatchingSnapshot();
    });
  });

  describe('after declaring the expected dependencies to an empty array', () => {
    beforeEach(() => {
      FeatureToggles.setExpectedDependencies([]);
    });

    test('any feature with dependencies should throw an error', () => {
      expect(() => FeatureToggles.create([features.WithDependencies])).toThrowErrorMatchingSnapshot();
    });
  });

  describe('after declaring the expected dependencies to a non-array', () => {
    beforeEach(() => {
      FeatureToggles.setExpectedDependencies(['lang']);
      FeatureToggles.setExpectedDependencies(false);
    });

    test('dependencies should not be limited', () => {
      let toggles;
      expect(() => {
        toggles = FeatureToggles.create([
          features.WithUnexpectedDependencies,
          features.WithDependencies,
        ]);
      }).not.toThrow();
      expect(toggles).toBeTruthy();
    });
  });
});
