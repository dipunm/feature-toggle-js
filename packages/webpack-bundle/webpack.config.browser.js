const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const target = 'web';

module.exports = {
  target,
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  plugins: [new HtmlWebpackPlugin()],
};
