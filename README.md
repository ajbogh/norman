# norman

Norman is a NodeJS-based automation system. The name is based on a story that my wife told me of her grandmother yelling at her grandfather to get her a beer. "Norman! Get me a beer!" I used that story as inspiration to develop "Norman", the NodeJS assistant. Feel free to yell its name while requesting a beer.

What makes Norman different from Google Assistant, Alexa, and Siri? It's fully customizable by you, the owner, and it can be run locally without internet connection. The only internet you need is after adding new configuration commands you will need to process the new commands using an online tool. After that the system will run offline.

Norman is light weight and runs on small hardware specs. Add it to your Raspberry Pi, make a robot that accepts voice commands without using the cloud, and automate your house any way you want.

## Requirements

Python 3 or Python 2.7 with linked libraries (easiest is to install Python 3)
- Mac: `brew upgrade python`
- Linux: `sudo apt install python python-dev automake autoconf libtool bison swig`

**Recording program installation:**

Norman uses a command line microphone recording system, usually `rec` with Linux, or `arecord` or `sox` for Windows and Mac. Mac users should install `sox`, we do not support Windows yet (sorry).

Mac only:

```bash
brew install sox
```

**Note:** Installation may take some time because modules must be configured and built using make.

## Installation

Make sure Python 3 and the development libs are installed before continuing.

*Tested on Ubuntu and Mac*

```bash
npm install
```

**Where are things installed?!?**

A few tools are used to process local speech. Pocketsphinx by Carnegie Mellon University, and sphinxbase. Both are downloaded from Github and placed in the node_modules directory. The installation scripts in package.json configure each library to use their own node_modules directory and the binaries are placed in the respective node_modules directory. Norman doesn't attempt to use a global version of these files.

## Configuration

Edit `conf/commands.conf.js` to add new keywords and commands. Commands are anything that can run on the command line. Plugins can be executed from the plugins folder using your interpreter of choice, for example `sh plugins/myfile.sh` or `python plugins/myfile.py` or `node myfile.js`.

```
  // Plugins can be ran by using the plugins/script.ext path.
  // All plugins must be in JSON format with the key being the spoken word, 
  // and the command to run in the terminal as the value.
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

Command keywords can be one or more words, and can be spoken in any order or within a phrase. For instance, a command can be "say hello" and you could say "computer please say hello". As long as the matched phrase is 75% of the spoken words minus the name keyword ("computer" in this case), then the command will activate. The match percentage can be adjusted with the `--matchPercentage` property.

```
  'morning': 'say "good morning sir"',
  'hello world': 'echo "hello world"',
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

Some commands require dependencies, such as the `espeak` application (for Ubuntu). You will have to install these separately. For instance, `espeak` can be installed using 

```bash
sudo apt install espeak
```

Then you can use the command `norman say hello` and your computer will say "hello" to you.

## Processing the config

After adding new commands to the config, the person editing it must run a processing command. This command creates a language model and dictionary file by sending the keywords to an online service. No commands are ever transmitted, only the keywords.

```bash
npm run config:convert
```

## Running the listener

After editing the `commands.conf.js` file, adding new keywords and commands, and running the `config:convert`, you may run the Norman node service.

```bash
npm run listener
```

### Specifying a specific microphone

Sometimes it's necessary to specify a custom microphone. While the system attempts to use the default system microphone, sometimes it doesn't quite work. You may notice that the system will stop as soon as it find its first speech block and gets stuck there. This is because it's using a microphone that produces a click during the initial connection but no further information.

To specify a custom mic, use the `--mic` command line option:

```bash
npm run listener --mic hw:2,0
```

The format is the same as arecord's mic option. To get this information use `arecord -l`.

```bash
~/Projects/Norman$ arecord -l
**** List of CAPTURE Hardware Devices ****
card 0: PCH [HDA Intel PCH], device 0: ALC1150 Analog [ALC1150 Analog]
  Subdevices: 1/1
  Subdevice #0: subdevice #0
card 0: PCH [HDA Intel PCH], device 2: ALC1150 Alt Analog [ALC1150 Alt Analog]
  Subdevices: 1/1
  Subdevice #0: subdevice #0
card 2: U0x46d0x81b [USB Device 0x46d:0x81b], device 0: USB Audio [USB Audio]
  Subdevices: 1/1
  Subdevice #0: subdevice #0
```

Using the information above, we can build the `hw:X,Y` property.

  card **2**: U0x46d0x81b [USB Device 0x46d:0x81b], device **0**: USB Audio [USB Audio]

The 2 will replace the X, and the 0 will replace the Y, making "hw:2,0".

## Debugging

Note: debugging Norman will cause a ton of output in the console and it may not be helpful. Only developers should use this command.

```bash
DEBUG=norman npm run listener --mic hw:2,0

# or

npm run listener:debug
```

Some Logitech USB microphones will produce Chipmunk-like recordings in Ubuntu. This can be fixed by creating or editing a file under `$HOME/.pulse/daemon.conf` and adding the following line:

```
default-sample-rate = 16000
```

Once the file is created and the line is added, restart the pulseaudio daemon.

```bash
pulseaudio -k
```

You may now test your microphone by using `arecord resources/output.wav` or using a program like Audacity. The audio should be crisp and at the correct speed.

Sometimes the system will hang as soon as it finds the first speech block. If you see the output below and the system doesn't produce any more output as you speak, it may be a pulseaudio problem.

```
> norman@0.0.1 listener /Projects/Norman
> node ./lib/listener.js

Got SIGNAL startComplete
Found speech block 18770 number
```

Restart pulseaudio and either wait a few seconds or start and stop the listener a couple times until the microphone works again.

```bash
pulseaudio -k
npm run listener
```

