// note: because Object.assign is shallow copy
const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');

module.exports = merge(common, {
  mode: 'production',
  entry: {
    'login-react': [__dirname + '/src/web/react/login.tsx'],
    'loggedin-react': [__dirname + '/src/web/react/loggedin.tsx'],
  },
});
