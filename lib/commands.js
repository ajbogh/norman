const reload = require('require-reload')(require);
const commands = reload('../conf/commands.conf.js');

// This is a wrapper around the commands.conf file
// It isn't necessary but it will abstract the implementation so that we can choose
// a js import, or a json file, or a raw text file like the original Blather implementation.
function readKeywords() {
  return commands;
}

module.exports = {
  readKeywords
};