var config = require('./config.json');

// Reconfigure with environment variables
var prefix = 'PW_WS_';
Object.keys(config).map((key) => {
  return prefix + key.toUpperCase();
}).forEach((key) => {
  if (process.env[key]) {
    config[key.substr(prefix.length).toLowerCase()] = process.env[key]
  }
});

module.exports = config;