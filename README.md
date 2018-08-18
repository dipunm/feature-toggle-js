# Smart feature toggles

[![Build Status](https://travis-ci.com/dipunm/smart-feature-toggles.svg?branch=master)](https://travis-ci.com/dipunm/smart-feature-toggles) ![Client bundle size](https://img.badgesize.io/https://s3.eu-west-2.amazonaws.com/smart-feature-toggles/bundle-web-lite.js?label=client%20size) ![Client bundle size](https://img.badgesize.io/https://s3.eu-west-2.amazonaws.com/smart-feature-toggles/bundle-web-lite.js?label=client%20size%20gzipped&compression=gzip)

_Client sizes are based on a webpack bundle using the lite version of the library. (See [Lite Client](#lite-client))_

## Contents

- [Installation](#installation)
- [Defining toggles](#defining-toggles)
- [Usage](#usage)
- [Features](#features)

## Installation

```bash
npm install smart-feature-toggles
```

## Defining toggles

- A feature toggle may only be `active` or `inactive`.
- Feature toggles can be scoped (eg. to a http request, or to an
  application context).
- A feature toggle _should not_ change value between calls\*.
- A feature toggle cannot be given arguments when being queried. All
  [dependencies](#dependencies) should be defined and ready before a toggle
  is queried.
- A feature toggle can be set up to alert developers when it is becoming
  old.

\*Smart feature toggles will cache the calculated value based on this
assumption, but the [auto reset feature](#auto-resets) exists to satisfy
more dynamic toggles.

## Usage

#### Require `smart-feature-toggles`:

```js
const FeatureToggles = require('smart-feature-toggles');
```

#### Set up alert handling: (see: [Housekeeping](#housekeeping))

```js
FeatureToggles.onHealthAlert((name, alert) => console.log(name, alert));
```

#### Name and configure your features:

```js
const features = [
  {
    name: 'my-feature',

    dependencies: ['request'],

    test: request => request.query.test_mode,

    health: () => {
      // If the toggle is getting old, return an alert
      if (new Date().getFullYear() > 2018) {
        return 'my-feature toggle is getting old!';
      }
    },
  },
];
```

#### Create your toggle client:

```js
const toggles = FeatureToggles.create(features);
```

#### Define your dependencies: (see: [Dependencies](#dependencies))

```js
const request = { query: { test_mode: true } };
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

#### Toggles _can_ be set up to auto update (see: [Auto Resets](#auto-resets))

# Features

### Scoping:

Read about [Scoping](docs/features/SCOPING.md)

### Housekeeping:

Read about [Housekeeping](docs/features/HOUSEKEEPING.md)

### Dependencies:

Read about [Dependencies](docs/features/DEPENDENCIES.md)

### Serialization:

Read about [Serialization](docs/features/SERIALIZATION.md)

### Auto Resets:

Read about [Auto Resets](docs/features/AUTO_RESETS.md)

### Browser Compatibility:

Read about the [Browser Compatibility](docs/features/BROWSER_COMPATIBILITY.md)

### Lite Client:

Read about the [Lite Client](docs/features/LITE_CLIENT.md)

# API

see the [API docs](#api). (coming soon)
