const process = require('process');
const tsconfig_json = process.env.TS_NODE_PROJECT || 'tsconfig.webpack.json';

module.exports = {
  // mode: 'development',
  // entry: {
  //   // depend on mode
  // },
  output: {
    path: __dirname + '/bundle/auth-portal/bundle',
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
};
