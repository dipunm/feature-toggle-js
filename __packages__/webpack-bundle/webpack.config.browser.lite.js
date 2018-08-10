const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const target = 'web';

module.exports = {
  target,
  entry: './index.js',
  output: {
    filename: 'bundle-web-lite.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  plugins: [new HtmlWebpackPlugin()],
  resolve: {
    alias: {
      'smart-feature-toggles': 'smart-feature-toggles/lite',
    },
  },
};
