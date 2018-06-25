/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';

export default {
  externals: ['pg', 'sqlite3', 'tedious', 'pg-hstore', 'mysql2', 'mssql', 'sqlite', 'postgres', 'mysql'],

  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      }
    }]
  },

  output: {
    path: path.join(__dirname, 'app'),
    filename: 'bundle.js',
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [
      path.join(__dirname, 'app'),
      'node_modules',
    ],
  },

  plugins: [
    new webpack.NamedModulesPlugin(),
  ],
    node: {
    __filename: true,
    __dirname: true
  }
};
