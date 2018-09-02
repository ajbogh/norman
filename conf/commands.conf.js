// commands are key:value pairs
// key is the sentence to listen for
// value is the command to run when the key is spoken

// The keyword will be used to invoke the listener.
// You can say the keyword at any time in continuous listening mode.
// The keyword can be used at any point within the command.
// This keyword is like "Hal", or "Jarvis", or "Computer", you must say it to activate the system.
module.exports = {
  norman: 'keyword',
  computer: 'keyword',
  hal: 'keyword',
  alfred: 'keyword',
  jeeves: 'keyword',

  // Cancels a running command by terminating it
  cancel: 'cancel',
  quiet: 'cancel',
  'shut up': 'cancel',
  enough: 'cancel',
  'stop command': 'cancel',

  // This is a basic command
  'hello world': 'echo "hello world"',
  'morning': 'espeak "good morning sir"',
  'time': 'espeak "`date +"%I:%M %p" | sed -e \'s/^0//\'`"',
  'what time is it': 'espeak "`date +"%I:%M %p" | sed -e \'s/^0//\'`"',
  'what time': 'espeak "`date +"%I:%M %p" | sed -e \'s/^0//\'`"',
  'what date is it': 'espeak "`date +\'%A %B\'` `date +\'%d, %Y\' | sed -e \'s/^0//\'`, `date +\'%I:%M %p\' | sed -e \'s/^0//\'`"',
  'what date': 'espeak "`date +\'%A %B\'` `date +\'%d, %Y\' | sed -e \'s/^0//\'`, `date +\'%I:%M %p\' | sed -e \'s/^0//\'`"',
  'date': 'espeak "`date +\'%A %B\'` `date +\'%d, %Y\' | sed -e \'s/^0//\'`, `date +\'%I:%M %p\' | sed -e \'s/^0//\'`"',

  // Plugins can be ran by using the plugins / script.ext path.
  // All plugins must be in the format "command:plugins/script.ext"
  'email': 'sh ./plugins/thunderbird.sh',
  'say hello': 'sh ./plugins/sayhello.sh'
};
