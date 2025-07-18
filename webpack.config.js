const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './main.js',
  output: {
    filename: 'main.min.js',
    path: path.resolve(__dirname, 'dist/assets'),
    clean: false,
  },
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log'],
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, './'),
    },
    port: 8080,
    open: true,
    hot: true,
  },
};
