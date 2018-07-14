# Feature Toggle JS
This library attempts to address most of the factors in [Martin Fowler's article](https://martinfowler.com/articles/feature-toggles.html) about feature toggles.

## Defining Toggles
- A feature toggle can only be `active` or `inactive`.
- Feature toggles can be scoped (eg. to a http request, or to an arbitrary time limit).
- A feature toggle is evaluated once and does not change (within it's scope).
- A feature toggle cannot be given arguments when being queried. All dependencies and relevant values must be defined before a toggle is queried.
- A feature toggle can be set up to alert developers when it is becoming old.

## Installation
```bash
npm install feature-toggle-js
```
```js
const toggler = require('feature-toggle-js');
```

## Usage
### Defining toggles
```js
toggler.define({
    name: 'new template design',
    dependencies: ['request', 'abService'],
    test: (request, abService) => {
        if (request.query.newTemplate) {
            return true;
        }
        return abService.track('experiment1')
            .then(variant => variant > 0)
    },
    health: () => {
        if(new Date() > new Date('2018-06-13')) {
            return 'please investigate whether the new template design feature toggle can be decommissioned.';
        }
    },
    isAsync: true
});
```

| Field | Description |
| -- | -- |
| name | (**mandatory**) A `string` that will be used to identify your toggle within your application. |
| dependencies | (**optional**) An `array` naming any dependencies required to caclulate the toggle state. |
| test | (**mandatory**) The `function` that calculates the toggle state. Any dependencies defined will be provided as arguments to this function in the same order. |
| health | (**optional**) A `function` that helps with housekeeping. (see: [Housekeeping](#Housekeeping)) |
| isAsync | (**optional**) A `boolean`, false by default, that should be true if the test function may return a promise. (see: [Coordinating features](#coordinating-features))|

### Creating instances
Depending on your application, you may need to create multiple instances of the toggle collection. Each instance is isolated and allows you to define different dependencies. _Even if you don't need multiple instances, you must create an instance._

A typical use case would be creating new instances for each request in an [express](https://expressjs.com/) application.

```js
const middleware = (req, res, next) => {
    const toggles = toggler.createInstance();
    toggles.set('request', req);
    toggles.set('abService', res.locals.abService);

    res.locals.toggles = toggles;
    next();
}
```

### Coordinating features
feature-toggle-js provides both a synchronous, and an asynchronous syntax for querying toggles:
```js
// sychronous syntax:
if(toggles.active('new template design') {
    // ... do something ...
} else {
    // ... do something ...
}

// asynchronous syntax with error handling:
const active = await toggles.fetch('new template design').catch(
    err => {
        logger.log(err);
        return false;
    });

if(active) {
    // ... do something ...
} else {
    // ... do something ...
}
```
For synchronous toggles, the asynchronous syntax will work fine. However, using the synchronous syntax on an asynchronous toggle will result in a thrown error.


## Housekeeping
Feature toggles enable us to release features quickly, but if not maintained, they can quickly add complexity to your code and as they mature, they become harder to understand and remove.

To combat this, you may add a health function to your toggle. The function will run every time the toggle is queried and you may return a useful alert message prompting you to re-evaluate the usefulness of the toggle.

To take full advantage of this feature, you should plan when or under what conditions you want to be reminded at the time you create the feature toggle.

### Getting reminded
```js
toggler.on('housekeeping', message => {
    logger.warn(message);
    slack.notify(message);
});
```

To get reminded, you **must** add a handler for the housekeeping event. You may choose how your application reminds you, be it logs, an email, notifications via webhooks, or some other custom solution.

The event will be emitted once per unique message, per toggles instance:
```js
toggler.define({
    name: 'toggle1',
    test: () => true,
    health: () => {
        if (isHeads(flipCoin())) {
            return 'message 1';
        } else {
            return 'message 2';
        }
    }
})
const instance = toggler.createInstance();
const instance2 = toggler.createInstance()
instance.active('toggle1');
instance.active('toggle1');
instance.active('toggle1');
instance.active('toggle1');
instance.active('toggle1');
instance.active('toggle1');
instance.active('toggle1');
instance.active('toggle1');

instance2.active('toggle1');
```
The above script will emit a maximum total of 3 messages. `instance` will likely emit one 'message 1' and one 'message 2'. Then `instance2` will emit one duplicate message.

If you need to throttle the messages more than this, you may do so within the event handler.

**If you do not subscribe to this event, the feature will fail silently and you will not receive any housekeeping messages.**

## Errors
For synchronous toggles, the asynchronous syntax will work fine. Attempting to use the synchronous syntax to query a toggle marked as async will **always** result in an exception.

If one or more dependencies have not yet been set, you will recieve an error. The synchronous syntax will throw an error, but the asynchronous syntax will provide the error by rejecting the promise.

