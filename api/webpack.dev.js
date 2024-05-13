const path = require('path');

/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
/* eslint-enable import/no-extraneous-dependencies */

module.exports = {
  mode: 'development',
  entry: './index.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dev'),
    filename: 'index.js'
  },
  devtool: '#cheap-module-source-map',
  externals: nodeExternals(),
  node: {
    __filename: true,
    __dirname: true
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install({environment: \'node\'});',
      raw: true,
      entryOnly: false
    })
  ],
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /(node_modules)/
    }]
  }
};
