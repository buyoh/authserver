const process = require('process');
const webpack = require('webpack');
const tsconfig_json = process.env.TS_NODE_PROJECT || 'tsconfig.webpack.json';

module.exports = {
  // mode: 'development',
  entry: {
    app: [
      './src/web/api.ts',
      'webpack-hot-middleware/client?reload=true&timeout=1000',
    ],
  },
  output: {
    path: __dirname + '/src/web/auth-portal/',
    publicPath: '/auth-portal',
    filename: 'bundle.js',
  },
  devServer: {
    static: {
      directory: __dirname + '/public',
      publicPath: '/auth-portal',
    },
    port: 8020,
    historyApiFallback: {
      rewrites: [{ from: /./, to: '/auth-portal' }],
    },
  },
  module: {
    rules: [
      {
        test: /src\/web\/.*\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: tsconfig_json,
          },
        },
      },
      // {
      //   test: /src\/web\/app\/.*\.scss$/,
      //   use: [
      //     { loader: 'style-loader' },
      //     { loader: 'css-modules-typescript-loader' },
      //     { loader: 'css-loader' },
      //     { loader: 'sass-loader' },
      //   ],
      // },
      // {
      //   test: /src\/web\/app\/.*\.css$/,
      //   use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      // },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss'],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
