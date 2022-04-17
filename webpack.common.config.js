const process = require('process');
const webpack = require('webpack');
const tsconfig_json = process.env.TS_NODE_PROJECT || 'tsconfig.webpack.json';

module.exports = {
  // mode: 'development',
  entry: {
    // app: [
    //   __dirname + '/src/web/api.ts',
    //   'webpack-hot-middleware/client?reload=true&timeout=1000',
    // ],
    'login-react': [
      __dirname + '/src/web/react/login.tsx',
      'webpack-hot-middleware/client?reload=true&timeout=1000',
    ],
    'loggedin-react': [
      __dirname + '/src/web/react/loggedin.tsx',
      'webpack-hot-middleware/client?reload=true&timeout=1000',
    ],
  },
  output: {
    path: __dirname + '/src/web/auth-portal-react/bundle',
    publicPath: '/auth-portal/bundle',
    filename: '[name].js',
  },
  // devServer: {
  //   static: {
  //     directory: __dirname + '/src/web/auth-portal-react/',
  //     publicPath: '/auth-portal/',
  //   },
  //   contentBase: __dirname + '/src/web/auth-portal-react/',
  //   port: 8020,
  //   historyApiFallback: {
  //     rewrites: [{ from: /./, to: '/auth-portal' }],
  //   },
  // },
  module: {
    rules: [
      {
        test: /src\/.*\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: tsconfig_json,
          },
        },
      },
      {
        test: /src\/web\/.*\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-modules-typescript-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /src\/web\/.*\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }], // both are needed?
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss'],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
