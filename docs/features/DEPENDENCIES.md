# Dependencies
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
may use the [auto reset feature](AUTO_RESETS.md).

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
    dependencies: ['myService'],
    test: () => {}
}]); // throws error

toggles.defineDependency('myObject', {}); // throws error
```

This should allow you to keep track of your feature toggle dependencies 
over time, and allow you to re-assess them each time you add new 
dependencies.
