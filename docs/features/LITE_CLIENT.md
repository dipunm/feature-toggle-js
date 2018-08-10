# Lite Client

_The lite client wraps serialized toggles, and provides an api that is similar to the full library to enable usage consistency within your application, with a much smaller bundle size._

The smart feature toggles library can be used on both node and web environments. When using the serialization feature to transfer toggles to the browser environemnt, you typically will only use a subset of the features in the browser.

To keep browser bundle sizes small, you can configure your application to load a lite version of the library. This version of the library only supports deserialisating toggles and therefore omits code related to:

- [Dependencies](DEPENDENCIES.md): _serialized toggles are already evaluated, and do not have dependencies._
- [Housekeeping](HOUSEKEEPING.md): _serialized toggles do not carry health handlers._
- [Serialization](SERIALIZATION.md): _the lite client can deserialize toggles, but does not contain the logic to serialize them._
- [AutoResets](AUTO_RESETS.md): _serialized toggles are not dynamic, so resetting toggles makes no sense._

You can load the lite version of the library by calling:

```js
const FeatureToggles = require('smart-feature-toggles/lite');
```
