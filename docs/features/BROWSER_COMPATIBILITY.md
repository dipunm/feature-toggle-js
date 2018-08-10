# Browser compatibility

This library was built to be executed on node. In order to run this library in the browser, it will need to be transformed using a bundling tool such as [browserify](http://TODO) or [webpack](http://TODO). This library requires no dependencies on the client side\* and uses no browser specific libraries, so it should be compatible with all browsers.

\*Read about joi substitution below.

TODO: check if 'browser' in package.json works with browserify.

## Joi substitution

In order to provide a good developer experience, this library uses [joi](http://TODO) to validate your features when constructing toggles. Unfortunately, joi is not compatible in the browser.

By default, when using webpack and targeting the web, joi validation will be skipped and joi is excluded from your bundle.

If you would like to joi validation in the browser, you may substitute joi for [joi-browser](http://TODO) when configuring your bundle for the web.

## Lite client

Alternatively, you may use the [lite client](LITE_CLIENT.md) if you are creating the toggles server side and want to use them on the browser.

_The lite client wraps serialized toggles, and provides an api that is similar to the full library to enable usage consistency within your application._
