const path = require('path');

module.exports = {
  entry: './src/chandra.js',
  mode: 'development',
  output: {
    filename: 'chandra-release.js',
    path: path.resolve(__dirname, 'chandra')
  },
};
