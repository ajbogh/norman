# norman

## Requirements

Python 3 or Python 2.7 with linked libraries (easiest is to install Python 3)
- Mac: `brew upgrade python`
- Linux: `sudo apt-get install python python-dev`

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

A few tools are used to process local speech. Pocketsphinx by Carnegie Mellon University, and sphinxbase. Both are downloaded from Github and placed in the node_modules directory. The installtion scripts in package.json configure each library to use their own node_modules directory and the binaries are placed in the respective node_modules directory. Norman doesn't attempt to use a global version of these files.
