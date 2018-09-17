# Norman

Norman is a NodeJS-based automation system. The name is based on a story that my wife told me of her grandmother yelling at her grandfather to get her a beer. "Norman! Get me a beer!" I used that story as inspiration to develop "Norman", the NodeJS assistant. Feel free to yell its name while requesting a beer.

What makes Norman different from Google Assistant, Alexa, and Siri? It's fully customizable by you, the owner, and it can be run locally without internet connection. The only internet you need is after adding new configuration commands you will need to process the new commands using an online tool. After that the system will run offline.

Norman is light weight and runs on small hardware specs. Add it to your Raspberry Pi, make a robot that accepts voice commands without using the cloud, and automate your house any way you want.

## Limitations

Norman only recognizes words in the commands file. If it hears you speaking it will try to pigeon-hole your conversation into that word list, meaning if you say "mail" or "male" it'll think you said "email". You can see some of these misunderstandings in the command output when Norman shows you the matched command. It will only activate the command if the activation keyword was spoken.

The limitation is that you can't ask Norman to do any random thing, and you can't perform a complex command like "remind me to %1", where `%1` is a variable for anything you want to do. Norman simply can't recognize any old word unless it had the entire dictionary in its word list, or unless all the words you would ever speak were in the commands file.

The nice part is the more commands you add to increase Norman's repertoire, the better it will become at recognizing words and the less it will attempt to pigeon-hole your conversation.

## Requirements

Python 3 or Python 2.7 with linked libraries (easiest is to install Python 3)
- Mac: `brew install ffmpeg && brew upgrade python`
- Linux: `sudo apt install python python-dev automake autoconf libtool bison swig ffmpeg`

Please note that ffmpeg is required during the process of removing background noise. It is used to convert the raw 

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
git clone git@github.com:ajbogh/norman.git
cd norman
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
npm run listener -- --mic hw:2,0
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

## Options

Command line options are provided after the `--` symbols when running `npm`. A word-based command line option is preceded with `--` as well, and single letter options will have a single `-`. Below are the list of available options.

To running the listener with an option, after the word `listener` include two dashes `--`, then a space, then the options and parameters.

Example:

```bash
npm run listener -- --mic hw:2,0
```

| Option          | Values        | Default        | Description
| --------------- | ------------- | -------------- | ------------- 
| mic             | hw:X,Y        | system default | Configures node mic to use a different hardware microphone
| rnnoise         | false, off, 0 | on, true, 1    | Turns off recombinant neural network background noise elimination (on by default)
| debug           | true          | false          | Enables verbose debug messages (developers and advanced users only please)
| matchPercentage | 0.5           | 0.75           | Allows Norman to be a little more lenient on the number of words required to match a phrase

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

### pocketsphinx_continuous failed

Pocketsphinx is installed using a tool called [napa](https://www.npmjs.com/package/napa). Napa downloads a git repository and places it into the node_modules directory. The problem with this is that npm will delete any folder that's not registered as a dependency or devDependency. While napa works great for simplifying the installation, it becomes a hassle whenever you need to install a different dependency because you have to always remember to `npm install` **after** you `npm install someDependency`.

If you see this error:

```
/Projects/norman/lib/pocketsphinx.js:27
    throw error;
    ^

Error: Command failed: ./node_modules/pocketsphinx/bin/pocketsphinx_continuous -infile ./resources/output.wav -lm ./resources/corpus/7268.lm -dict ./resources/corpus/7268.dic
./node_modules/pocketsphinx/bin/pocketsphinx_continuous: error while loading shared libraries: libpocketsphinx.so.3: cannot open shared object file: No such file or directory

    at ChildProcess.exithandler (child_process.js:291:12)
    at ChildProcess.emit (events.js:182:13)
    at maybeClose (internal/child_process.js:961:16)
    at Socket.stream.socket.on (internal/child_process.js:380:11)
    at Socket.emit (events.js:182:13)
    at Pipe._handle.close (net.js:595:12)
```

Run:

```
npm install
```
