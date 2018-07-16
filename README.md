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
[dependencies](docs/features/DEPENDENCIES.md) should be defined and ready before a toggle 
is queried.
- A feature toggle can be set up to alert developers when it is becoming 
old.

*Smart feature toggles will cache the calculated value based on this 
assumption, but the [auto reset feature](docs/features/AUTO_RESETS.md) exists to satisfy 
more dynamic toggles.

## Usage

#### Require `smart-feature-toggles`:
```js
const FeatureToggles = require('smart-feature-toggles');
```

#### Set up alert handling: (see: [Housekeeping](docs/features/HOUSEKEEPING.md))
```js
FeatureToggles.onHealthAlert(
    (name, alert) => console.log(name, alert)
);
```

#### Name and configure your features:
```js
const features = [{
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

#### Define your dependencies: (see: [Dependencies](docs/features/DEPENDENCIES.md))
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
toggles.values['my-feature']; // true

// once evaluated, the toggle will
// always return it's original value
request.query.test_mode = false;
toggles.get('my-feature'); // true
```

#### Toggles _can_ be set up to auto update (see: [Auto Resets](docs/features/AUTO_RESETS.md))

# API
see the [API docs](#api). (coming soon)

# Features
## [Scoping](docs/features/SCOPING.md)
## [Housekeeping](docs/features/HOUSEKEEPING.md)
## [Dependencies](docs/features/DEPENDENCIES.md)
## [Serialization](docs/features/SERIALIZATION.md)
## [Auto Resets](docs/features/AUTO_RESETS.md)
