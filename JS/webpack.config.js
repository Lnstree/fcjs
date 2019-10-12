var path = require('path');

module.exports = {
  entry: './src/nes.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-fc.js',
    library: 'fcgame'
  }
};