# norman

Norman is a NodeJS-based automation system. The name is based on a story that my wife told me of her grandmother yelling at her grandfather to get her a beer. "Norman! Get me a beer!" I used that story as inspiration to develop "Norman", the NodeJS assistant. Feel free to yell its name while requesting a beer.

What makes Norman different from Google Assistant, Alexa, and Siri? It's fully customizable by you, the owner, and it can be run locally without internet connection. The only internet you need is after adding new configuration commands you will need to process the new commands using an online tool. After that the system will run offline.

Norman is light weight and runs on small hardware specs. Add it to your Raspberry Pi, make a robot that accepts voice commands without using the cloud, and automate your house any way you want.

## Requirements

Python 3 or Python 2.7 with linked libraries (easiest is to install Python 3)
- Mac: `brew upgrade python`
- Linux: `sudo apt-get install python python-dev autoconf libtool`

**Recording program installation:**

Norman uses a command line microphone recording system, usually `rec` with Linux, or `arecord` or `sox` for Windows and Mac. Mac users should install `sox`, we do not support Windows yet (sorry).

Mac only:
```
brew install sox
```

**Note:** Installation may take some time because modules must be configured and built using make.

## Installation

Make sure Python 3 and the development libs are installed before continuing.

*Tested on Ubuntu and Mac*

```
npm install
```

**Where are things installed?!?**

A few tools are used to process local speech. Pocketsphinx by Carnegie Mellon University, and sphinxbase. Both are downloaded from Github and placed in the node_modules directory. The installation scripts in package.json configure each library to use their own node_modules directory and the binaries are placed in the respective node_modules directory. Norman doesn't attempt to use a global version of these files.

## Configuration

Edit `conf/commands.conf.js` to add new keywords and commands. Commands are anything that can run on the command line. Plugins can be executed from the plugins folder using your interpreter of choice, for example `sh plugins/myfile.sh` or `python plugins/myfile.py` or `node myfile.js`.

```
  // Plugins can be ran by using the plugins / script.ext path.
  // All plugins must be in the format "command:plugins/script.ext"
  'email': 'sh plugins/thunderbird.sh',
```

The "keyword" is required, this is denoted by the text which will be spoken and the "keyword" value in the config file. It's allowed to have multiple `keywords`, although only the longest match will activate a command. Keywords can be spoken in any order, such as "computer good morning" or "good morning computer".

Keyword example:

```
  computer: 'keyword',
  hal: 'keyword',
  norman: 'keyword',
  'hey you guys': 'keyword'
```

Command keywords can be one or more words, and can be spoken in any order or within a phrase. For instance, a command can be "say hello" and you could say "computer please say hello". As long as the matched phrase is 75% of the spoken words minus the name keyword ("computer" in this case), then the command will activate. The match percentage can be adjusted.

```
  'morning': 'say "good morning sir"',
  'hello world': 'echo "hello world"',

  // Plugins can be ran by using the plugins / script.ext path.
  // All plugins must be in the format "command:plugins/script.ext"
  'email': 'sh plugins/thunderbird.sh',
```

The last executed command can be canceled by issuing a 'cancel' command. Several 'cancel' commands are provided in the `commands.conf.js` file already. This is useful for commands that create speech.

```
  // Cancels a running command by terminating it
  cancel: 'cancel',
  quiet: 'cancel',
  'shut up': 'cancel',
  enough: 'cancel',
  'stop command': 'cancel',
```

## Processing the config

After adding new commands to the config, the person editing it must run a processing command. This command creates a language model and dictionary file by sending the keywords to an online service. No commands are ever transmitted, only the keywords.

```
npm run config:convert
```

## Running the listener

After editing the `commands.conf.js` file, adding new keywords and commands, and running the `config:convert`, you may run the Norman node service.

```
npm run listener
```
