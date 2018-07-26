const sinon = require('sinon');

describe('evaluating a toggle', () => {
  let FeatureToggles;
  let toggles;
  let features;
  beforeEach(() => {
    features = [
      {
        name: 'toggle1',
        test: sinon.stub(),
      },
    ];
    toggles = undefined;
    jest.resetModules();
    FeatureToggles = require('../server'); // eslint-disable-line global-require
  });

  describe('via the get method', () => {
    beforeEach(() => {
      toggles = FeatureToggles.create(features);
      sinon.spy(toggles, 'get');
      toggles.get('toggle1');
    });

    test('should call the test method', () => {
      sinon.assert.called(features[0].test);
    });

    test('should return a boolean', () => {
      expect(toggles.get.lastCall.returnValue).not.toBe(undefined);
      expect(toggles.get.lastCall.returnValue).toBe(false);
    });
  });

  describe('via the values proxy property', () => {
    beforeEach(() => {
      features[0].test.returns(undefined);
      toggles = FeatureToggles.create(features);
      toggles.values['toggle1']; // eslint-disable-line no-unused-expressions
    });

    test('should call the test method', () => {
      sinon.assert.called(features[0].test);
    });
  });

  describe('multiple times', () => {
    beforeEach(() => {
      features[0].test.onCall(0).returns(true);
      features[0].test.onCall(1).returns(false);

      toggles = FeatureToggles.create(features);
      sinon.spy(toggles, 'get');
      toggles.get('toggle1');
      toggles.get('toggle1');
    });

    test('should only call the test method once', () => {
      sinon.assert.calledOnce(features[0].test);
    });

    test('should return the same value every time', () => {
      expect(toggles.get.returnValues).toEqual([true, true]);
    });
  });

  describe('with dependencies', () => {
    beforeEach(() => {
      features[0].dependencies = ['lang'];
      toggles = FeatureToggles.create(features);
    });
    describe('without defining the dependency', () => {
      test('should throw with a meaningful message', () => {
        expect(() => {
          toggles.get('toggle1');
        }).toThrowErrorMatchingSnapshot();
      });
    });

    describe('after defining the dependency', () => {
      const dependencyValue = 'en';
      beforeEach(() => {
        toggles.defineDependency('lang', dependencyValue);
      });
      test('should call the test method providing the dependency', () => {
        toggles.get('toggle1');
        sinon.assert.calledWith(features[0].test, dependencyValue);
      });
    });
  });

  describe('amongst toggles with undefined dependencies', () => {
    beforeEach(() => {
      features.push({
        name: 'toggleWithDependency',
        dependencies: ['lang'],
        test: lang => lang,
      });
      toggles = FeatureToggles.create(features);
    });
    test('should not throw any errors', () => {
      expect(() => {
        toggles.get('toggle1');
      }).not.toThrow();
    });
  });

  describe('that was mispelled', () => {
    beforeEach(() => {
      toggles = FeatureToggles.create(features);
    });
    test('should throw with a meaningful message', () => {
      expect(() => {
        toggles.get('misspelling');
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
