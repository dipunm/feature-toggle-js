# Scoping
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
