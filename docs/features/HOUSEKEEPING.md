# Housekeeping
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
const { throttle } = require('lodash')
FeatureToggles.onHealthAlert(alertUnhealthyFeature);

// This ensures that you will see one of each alert at most once per 3 hours
const throttles = {};
const THREE_HOURS = 10800000;
function alertThrottled(key) {
    throttles[key] = throttles[key] || throttle(() => 
        slack.sendWarning(
            `unhealthy feature toggle found: ${key.name}: ${key.message}`),
            THREE_HOURS);
    
    throttles[key]();
}
function alertUnhealthyFeature(name, message) {
    const hour = new DateTime().getHours();
    const withinWorkingHours =  hour > 9 && hour < 19;
    if(withinWorkingHours) {
        alertThrottled({name, message});
    }
}
```
