const FeatureToggles = require('../server');

describe('param validation when calling FeatureToggles.create()', () => {
  const someFeatures = [
    { name: 'toggle1', test: () => true },
    { name: 'toggle2', test: () => true },
    { name: 'toggle3', test: () => true },
  ];
  function change(arr, ind, mutate) {
    return arr.map((e, i) => {
      if (i === ind) {
        const obj = Object.assign({}, e);
        mutate(obj);
        return obj;
      }
      return e;
    });
  }

  const badArgumentSpecs = (() => {
    const specs = [];
    specs.push(['given no parameters', () => FeatureToggles.create()]);
    specs.push(['given an empty array', () => FeatureToggles.create([])]);

    specs.push([
      'given a toggle object with no name',
      () => {
        const features = change(someFeatures, 1, (toggle) => {
          delete toggle.name;
        });
        FeatureToggles.create(features);
      },
    ]);

    specs.push([
      'given a toggle object with an empty name',
      () => {
        const features = change(someFeatures, 1, (toggle) => {
          toggle.name = '';
        });
        FeatureToggles.create(features);
      },
    ]);

    specs.push([
      'given a toggle object with a non-string name',
      () => {
        const features = change(someFeatures, 1, (toggle) => {
          toggle.name = 0;
        });
        FeatureToggles.create(features);
      },
    ]);

    specs.push([
      'given a toggle object with a duplicate name',
      () => {
        const features = change(someFeatures, 1, (toggle) => {
          toggle.name = 'toggle1';
        });
        FeatureToggles.create(features);
      },
    ]);

    specs.push([
      'given a toggle object with no test',
      () => {
        const features = change(someFeatures, 1, (toggle) => {
          delete toggle.test;
        });
        FeatureToggles.create(features);
      },
    ]);

    specs.push([
      'given a toggle object with a non function test',
      () => {
        const features = change(someFeatures, 1, (toggle) => {
          toggle.test = true;
        });
        FeatureToggles.create(features);
      },
    ]);

    specs.push([
      'given a toggle object with a non function test',
      () => {
        const features = change(someFeatures, 1, (toggle) => {
          toggle.test = true;
        });
        FeatureToggles.create(features);
      },
    ]);

    specs.push([
      'given a toggle object with a non array dependencies',
      () => {
        const features = change(someFeatures, 1, (toggle) => {
          toggle.dependencies = 'env';
        });
        FeatureToggles.create(features);
      },
    ]);

    specs.push([
      'given a toggle object with a non function health',
      () => {
        const features = change(someFeatures, 1, (toggle) => {
          toggle.health = 'unhealthy';
        });
        FeatureToggles.create(features);
      },
    ]);

    specs.push([
      'given a toggle object with a non function resetOn',
      () => {
        const features = change(someFeatures, 1, (toggle) => {
          toggle.resetOn = '2h';
        });
        FeatureToggles.create(features);
      },
    ]);
    return specs;
  })();

  describe.each(badArgumentSpecs)('|| %s ||', (desc, action) => {
    test('should throw with a meaningful message', () => {
      expect(action).toThrowErrorMatchingSnapshot();
    });
  });
});
