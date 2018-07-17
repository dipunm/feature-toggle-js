# Auto Resets
**Disclaimer:** _Typically, this feature is **not** recommended if you can 
scope your `FeatureToggles` instances to shorter lifespans 
(see: [Scoping](SCOPING.md)). If the value of a toggle were to change mid-way 
through an asynchronous operation within your application, the operation 
may produce unexpected results._ **Use with care.**

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

## Live updates
Another use case would be to implement live feature toggling in the browser. 
This would allow you to produce this sort of effect: 

_MPJ toggles what the default sorting should be from `Time sorting` to `Natural sorting` and_ 
_the react application changes without requiring the user to refresh:_ [(YouTube) Incremental rollout and targeting individual users - #3 LaunchDarkly Feature Flags by Fun Fun Function @5m27s](https://youtu.be/ilRGOvR4HxU?t=5m27s)
