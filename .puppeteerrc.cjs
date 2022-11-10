// set up a default cache directory so that the chromium browser will be installed in this directory. This helps when we are packing around the package
const { join } = require('path');

module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};

// Notice this is only possible with CommonJS configuration files as information about the ambient environment is needed (in this case, __dirname). (from documentation)
