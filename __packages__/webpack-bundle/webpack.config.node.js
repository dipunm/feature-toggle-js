const path = require('path');

const target = 'node';

module.exports = {
  target,
  entry: './index.js',
  output: {
    filename: 'bundle-node.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
};
