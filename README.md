# Smart feature toggles 


## Defining toggles
- A feature toggle may only be `active` or `inactive`.
- Feature toggles can be scoped (eg. to a http request, or to an application context).
- A feature toggle _should_ not change value between calls*.
- A feature toggle cannot be given arguments when being queried. All dependencies and relevant values must be defined before a toggle is queried.
- A feature toggle can be set up to alert developers when it is becoming old.

*Smart feature toggles will cache the calculated value based on this assumption, but the [reset feature](#resets) exists to satisfy more dynamic toggles.

## Installation
```bash
npm install smart-feature-toggles
```

## Basic usage example
```js
const FeatureToggles = require('smart-feature-toggles');
const EventEmitter = require('events');
const ee = new EventEmitter();

features = [{
    name: 'my-feature',
    dependencies: ['request']
    test: (request) => request.query.test_mode,
    resetOn: (reset) => ee.on('flush-my-feature', reset),
    health: () => new Date().getFullYear() > 2018 
        ? 'my-feature toggle is getting old' 
        : null
}];


const toggles = new FeatureToggles(
    features, 
    alertUnhealthyFeature
);

const request = {query: {test_mode: true}};
toggles.defineDependency('request', request);

console.log(toggles.get('my-feature')) // true

// once evaluated, the toggle will keep it's value
request.query.test_mode = false;
console.log(toggles.get('my-feature')) // true

// we can force a reset if necessary
ee.emit('flush-my-feature');
console.log(toggles.get('my-feature')) // false

// features with a limited lifespan can be set up
// to automatically alert you or your team.
function alertUnhealthyFeature(name, message) {
    console.log(`unhealthy feature toggle found: 
        ${name}: ${message}`);
}
```

# API
see the [API docs](docs/API.md).

# Features
## Housekeeping
One of the most important features in this library, is the ability to define when your feature toggle will start alerting you to clean up.

You can base the alert on an expiry date, server load, or any other data you have access to.

Health checks are executed every time an instance of `FeatureToggles` is created.

## Dependencies
Dependencies are useful when you want to create various toggles based on various sources of data. They can be anything from a service or function, to a value of any type.

Dependencies are only retrieved when required. If you have not set any dependencies, but try to retrieve the value of a toggle with no dependencies, you will receive the toggle value as expected. This is useful when you have a mix of simple and more complex toggles; you can start using the simpler toggles right away without having to source all the dependencies for your more complex toggles.

**Note:** If you attempt to query toggle before it's dependencies have been set, the client _will_ throw an exception.

Dependencies may only ever be set once per `FeatureToggles` instance. You can rest assured that your feature toggle will not change it's value unexpectedly. 

**Note:** Attempting to set a dependency a second time will result in an exception being thrown. If you require your toggle to be more dynamic, you should use the [reset feature](#resets).

## Resets
**Disclaimer:** Typically, this feature is **not** recommended if you can scope your `FeatureToggles` instances to shorter lifespans. If the value of a toggle were to change mid-way through an asynchronous operation within your application, the operation may produce unexpected results.

Some dependencies may be more dynamic than others; a simple example is the [Hobknob client](https://github.com/opentable/hobknob-client-nodejs/blob/master/src/Client.js).

To keep your application lean and fast, the smart-feature-toggle client uses a synchronous api and the value of each toggle is calculated only once per `FeatureToggles` instance.

If your dependent service may update, we provide a resetOn callback property. This callback will recieve a `reset` method that you may use at any time to force the calculated value to be forgotten so that it may be re-calculated.

```js
const features = [{
    name: 'my-feature-123',
    ...,
    resetOn: (reset) => {
        hobknob.on('updated-cache', (changed) => {
            if(changed.find(toggle => toggle.name === 'my-feature-123')) {
                reset();
            }
        })
    }
}]
```