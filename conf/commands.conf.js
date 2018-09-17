// commands are key:value pairs
// key is the sentence to listen for
// value is the command to run when the key is spoken

// The keyword will be used to invoke the listener.
// You can say the keyword at any time in continuous listening mode.
// The keyword can be used at any point within the command.
// This keyword is like "Hal", or "Jarvis", or "Computer", you must say it to activate the system.

// You may edit this file while the listener is running and the listener will automatically update
// itself after a few seconds. You can see it updating in the console, but give it a few moments to complete.
module.exports = {
  norman: 'keyword',
  computer: 'keyword',
  hal: 'keyword',
  alfred: 'keyword',

  // Cancels a running command by terminating it
  cancel: 'cancel',
  quiet: 'cancel',
  'shut up': 'cancel',
  enough: 'cancel',
  'stop command': 'cancel',

  // This is a basic command
  'hello world': 'echo "hello world"',
  'morning': 'espeak "good morning sir"',
  'time': 'espeak "the current time is `date +"%I" | sed -e \'s/^0//\'`,`date +"%M %p" | sed -e \'s/^0/O/\'`"',
  'what time is it': 'espeak "the current time is `date +"%I" | sed -e \'s/^0//\'`,`date +"%M %p" | sed -e \'s/^0/O/\'`"',
  'what time': 'espeak "the current time is `date +"%I" | sed -e \'s/^0//\'`,`date +"%M %p" | sed -e \'s/^0/O/\'`"',
  'what date is it': 'espeak "the current date is `date +\'%A %B\'` `date +\'%d, %Y\' | sed -e \'s/^0//\'`, `date +"%I" | sed -e \'s/^0//\'`,`date +"%M %p" | sed -e \'s/^0/O/\'`"',
  'what date': 'espeak "the current date is `date +\'%A %B\'` `date +\'%d, %Y\' | sed -e \'s/^0//\'`, `date +"%I" | sed -e \'s/^0//\'`,`date +"%M %p" | sed -e \'s/^0/O/\'`"',
  'date': 'espeak "the current date is `date +\'%A %B\'` `date +\'%d, %Y\' | sed -e \'s/^0//\'`, `date +"%I" | sed -e \'s/^0//\'`,`date +"%M %p" | sed -e \'s/^0/O/\'`"',
  'thank you': 'espeak "You\'re welcome your highness"',
  'thanks': 'espeak "You\'re welcome your highness"',
  'thanks a lot': 'espeak "You\'re welcome your highness"',

  // Plugins can be ran by using the ./plugins/script.ext path.
  // All plugins must be in the format 'command': 'executable ./plugins/script.ext'
  'email': 'sh ./plugins/thunderbird.sh',
  'say hello': 'sh ./plugins/sayhello.sh',
  'quote': 'node ./plugins/random-quote.js',
  'sing a song': 'sh ./plugins/daisy.sh',
  'list commands': 'node ./plugins/list-commands.js'
};
