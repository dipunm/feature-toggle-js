# Smart feature toggles 

## Installation
```bash
npm install smart-feature-toggles
```

## Defining toggles
- A feature toggle may only be `active` or `inactive`.
- Feature toggles can be scoped (eg. to a http request, or to an 
application context).
- A feature toggle _should not_ change value between calls*.
- A feature toggle cannot be given arguments when being queried. All 
[dependencies](#dependencies) should be defined and ready before a toggle 
is queried.
- A feature toggle can be set up to alert developers when it is becoming 
old.

*Smart feature toggles will cache the calculated value based on this 
assumption, but the [auto reset feature](#auto-resets) exists to satisfy 
more dynamic toggles.

## Usage

#### Require `smart-feature-toggles`:
```js
const FeatureToggles = require('smart-feature-toggles');
```

#### Set up alert handling: (see: [Housekeeping](#housekeeping))
```js
FeatureToggles.onHealthAlert(
    (name, alert) => console.log(name, alert)
);
```

#### Name and configure your features:
```js
features = [{
    name: 'my-feature',

    dependencies: [ 'request' ],

    test: ( request ) => 
        request.query.test_mode,
    
    health: () => {
        // If the toggle is getting old, return an alert
        if( new Date().getFullYear() > 2018 ) {
            return 'my-feature toggle is getting old!'; 
        }
    }
}];
```

#### Create your toggle client:
```js
const toggles = FeatureToggles.create(features);
```

#### Define your dependencies: (see: [Dependencies](#dependencies))
```js
const request = {query: {test_mode: true}};
toggles.defineDependency('request', request);
```

#### Use your feature toggle:
```js
if (toggles.get('my-feature')) { // true
    ...
}

// alternative syntax. 
toggles['my-feature']; // true

// once evaluated, the toggle will
// always return it's original value
request.query.test_mode = false;
toggles.get('my-feature'); // true
```

#### Toggles _can_ be set up to auto update (see: [Auto Resets](#auto-resets))

# API
see the [API docs](#api). (coming soon)

# Features
## Scoping
Each new instance of `FeatureToggles` may have slightly different 
dependencies, and there is no limit to how many instances you can create.

A typical scenario, is to scope the feature toggles to user requests in an 
[express](https://expressjs.com/) application.

```js
const express = require('express');
const features = require('./features');
const app = express();

// creating a middleware
app.use((req, res, next) => {
    const toggles = FeatureToggles.create(features);
    toggles.defineDependency('request', req);

    // http://expressjs.com/en/4x/api.html#res.locals
    res.locals.toggles = toggles;
    next();
});
```

Each new instance of `FeatureToggles` will have a clear cache of toggle 
values. The cache will save the calculated values of each toggle as they 
are queried for the first time.

## Housekeeping
One of the most important features in this library, is the ability to 
define when your feature toggle will start alerting you to clean up.

You can base the alert on an expiry date, server load, or any other data 
you have access to. You also have full control of the message that is 
alerted.

```js
const features = [{
    ...,
    test: () => new Date() < new Date('2018-12-25')
    health: () => {
        const afterEve = new Date() >= new Date('2018-12-25');
        const afterNewYear = new Date() >= new Date('2019-01-01');
        if (afterEve && !afterNewYear) {
            return 'X-mas eve has passed. Please remove this feature';
        }

        if (afterNewYear){
            return 'Seriously, remove this feature already!'
        }
    }
}]
```

Health checks are executed every time an instance of `FeatureToggles` is 
created. If this creates too many alerts to manage, you may add custom 
throttling in the unhealthyFeature handler.

```js
FeatureToggles.onHealthAlert(alertUnhealthyFeature);
function alertUnhealthyFeature(name, message) {
    const hour = new DateTime().getHours();
    const withinWorkingHours =  hour > 9 && hour < 19;
    if(withinWorkingHours) {
        slack.sendWarning(`unhealthy feature toggle found: 
        ${name}: ${message}`);
    }
}
```

## Dependencies
Dependencies are useful when you want to create various toggles based on 
various sources of data. They can be anything from a service or function, 
to a value of any type.

Some examples:
```js
toggles.defineDependency('server-name', 'qa-sf1');
toggles.defineDependency('hobknob', hobkbobClient);
toggles.defineDependency('getAbVariant', (key) => abService.variant(key));
toggles.defineDependency('user', res.locals.user);
toggles.defineDependency('domain', 'com');
toggles.defineDependency('lang', 'en-GB');
```

### Not all dependencies need to be defined before toggles are used. 
Even if you have _not_ defined all the dependencies, if you try to retrieve 
the value of a toggle, you will receive the value as expected so long as 
you **have** defined the dependencies for that specific toggle.

This is useful when you have a mix of simple and more complex toggles that 
would require extra contexual data to work. You can start using the simpler 
toggles before defining the dependencies for your more complex toggles.
```js
toggles.defineDependency('domain', 'couk');
toggles.get('use auth middleware');

toggles.defineDependency('user_role', 'admin');
toggles.get('enable admin features');
```

**Note:** If you attempt to query a toggle before its dependencies have 
been set, the client **will** throw an exception. This usually indicates 
that your application does not have enough data to calculate the toggle's 
value yet and you should re-order the sequence of actions within your 
application.

```js
const features = [
    {
        name: 'simple',
        test: () => true
    },
    {
        name: 'complex',
        dependencies: ['service'],
        test: (s) => s.isActive;
    },
];
const toggles = FeatureToggles.create(features);
toggles.get('simple'); // true
toggles.get('complex'); // throws an error.
```

### Dependencies may only ever be set once per FeatureToggles instance.
You can rest assured that your feature toggle will not change it's value 
unexpectedly. 

**Note:** Attempting to set a dependency a second time will result in an 
exception being thrown. If you require your toggle to be more dynamic, you 
may use the [auto reset feature](#auto-resets).

```js
// no errors.
toggles.defineDependency('user', {name: 'betty'});

// throws an error. Dependencies cannot be re-defined.
toggles.defineDependency('user', {name: 'bob'}); 
```

### Keeping track of dependencies
As your application evolves and feature toggles come and go, you may find 
your application riddled with `toggles.defineDependency(...)` calls.

To help manage these, you can define a list of **expected dependencies** 
globally. Doing so will enforce a few things:
- `FeatureToggles` will throw an exception when created with a feature that 
requires an unknown dependency,
- `toggles.defineDependency` will throw an exception when an unexpected 
dependency is defined.

```js
FeatureToggles.setExpectedDependencies([
    'lang', 'domain', 'hobknob', 
    'user', 'env'
]);

FeatureToggles.create([{
    name: 'my-toggle',
    dependencies: ['user'],
    test: () => {}
}]); // throws error

toggles.defineDependency('user', {}); // throws error
```

This should allow you to keep track of your feature toggle dependencies 
over time, and allow you to re-assess them each time you add new 
dependencies.

## Serialization

Applications may require sending toggles over the wire. To enable this, 
toggles can be serialized to JSON.
```js
// evaluates and then serializes all the toggles.
const serialized1 = toggles.toJSON()

// a whitelist array or function can be provided (see API).
const serialized2 = toggles.toJSON(['my-feature', 'my-feature2'])
const serialized3 = toggles.toJSON(name => name.startsWith('my-'));
```

Serialized toggles are simple hash tables. Keep in mind that accessors may 
produce different results.
```js
toggles['mispelled-toggle']; // throws error
serialized1['mispelled-toggle']; // undefined
```

This can be alleviated by using the `fromJSON` method.
```js
// if you want strict toggle checks, use the fromJSON method
const toggles2 = FeatureToggles.fromJSON(serialized1);
toggles2.get('my-feature') // false
toggles2['my-feature'] // false
toggles2['mispelled-toggle'] // throws error
```

## Auto Resets
**Disclaimer:** Typically, this feature is **not** recommended if you can 
scope your `FeatureToggles` instances to shorter lifespans 
(see: [Scoping](#scoping)). If the value of a toggle were to change mid-way 
through an asynchronous operation within your application, the operation 
may produce unexpected results.

Some dependencies may be more dynamic than others; a simple example is the 
[Hobknob client](https://github.com/opentable/hobknob-client-nodejs/blob/master/src/Client.js).

**Note:** Even with the hobknob client running server-side, typically, you 
would want to wait until you have finished processing your request before 
updating the toggle. By scoping the toggles to the request, you can avoid 
needing to use the auto reset feature.

To keep your application lean and fast, the smart-feature-toggle client 
uses a synchronous api and the value of each toggle is calculated only once 
per `FeatureToggles` instance.

If your dependent service may update, we provide a resetOn callback 
property. This callback will recieve a `reset` method that you may use at 
any time to force the calculated value to be forgotten so that it may be 
re-calculated the next time it is queried.

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

### Live updates
Another use case would be to implement live feature toggling in the browser. 
This would allow you to produce this sort of effect: 
[(YouTube) Incremental rollout and targeting individual users - #3 LaunchDarkly Feature Flags by Fun Fun Function @5m27s](https://youtu.be/ilRGOvR4HxU?t=5m27s)