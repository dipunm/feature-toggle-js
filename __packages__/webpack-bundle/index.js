import { fromJSON } from 'smart-feature-toggles';

const toggles = fromJSON({
  values: {
    toggle1: true,
    toggle2: false,
  },
});

console.log('toggle1: ', toggles.get('toggle1'));
console.log('toggle2: ', toggles.values.toggle2);
