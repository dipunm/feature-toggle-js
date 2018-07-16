# Serialization

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
toggles.values['mispelled-toggle']; // throws error
serialized1.values['mispelled-toggle']; // undefined
```

This can be alleviated by using the `fromJSON` method.
```js
// if you want strict toggle checks, use the fromJSON method
const toggles2 = FeatureToggles.fromJSON(serialized1);
toggles2.get('my-feature') // false
toggles2.values['my-feature'] // false
toggles2.values['mispelled-toggle'] // throws error
```
