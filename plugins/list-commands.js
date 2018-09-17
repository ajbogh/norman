const commands = require('../conf/commands.conf');

const commandKeys = Object.keys(commands);

for(let i = 0; i < commandKeys.length; i++){
  let key = commandKeys[i];
  commandKeys[i] = [key];
  if(commands[key] === 'keyword' || commands[key] === 'cancel'){
    commandKeys[i].push(commands[key]);
  } else {
    commandKeys[i].push('command');
  }
}

console.log('');
console.log('The following is a list of commands you can say:');
console.log(commandKeys);
