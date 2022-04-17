// note: because Object.assign is shallow copy
const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  entry: {
    'login-react': [
      __dirname + '/src/web/react/login.tsx',
      'webpack-hot-middleware/client?reload=true&timeout=1000',
    ],
    'loggedin-react': [
      __dirname + '/src/web/react/loggedin.tsx',
      'webpack-hot-middleware/client?reload=true&timeout=1000',
    ],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
