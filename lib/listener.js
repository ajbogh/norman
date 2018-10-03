process.title = 'norman-listener';

const argv = require('yargs').argv;
const debug = require('debug')('norman-listener');
const fs = require('fs');
const mic = require('mic');
const path = require('path');
const reload = require('require-reload')(require);
const { execSync, exec } = require('child_process');
let { recognizeWords } = reload('./recognizer');
console.log(argv);
const commandsFile = `${path.resolve(__dirname)}/../conf/commands.conf.js`;

let lastMatchTime = 0;
let currentProc = null;

let outputFileStream;
function startMicInstance() {
  debug("startMicInstance");
  var micInstance = mic({
    device: argv.mic || 'default',
    channels: 1,
    rate: '16000', // the decoder expects 16000, do not modify
    debug: Boolean(argv.debug) || false,
    exitOnSilence: 6
  });
  var micInputStream = micInstance.getAudioStream();
  outputFileStream = fs.WriteStream(`${path.resolve(__dirname)}/../resources/output.wav`);
  micInputStream.pipe(outputFileStream);

  bindListeners(micInputStream, micInstance, outputFileStream);
  micInstance.start();
}

function bindListeners(micInputStream, micInstance, outputFileStream){

  let consecutiveSilence = 0
  const numSilenceFramesExitThresh = 6;
  let speechData = 0;
  let consecutiveSpeechBlocks = 0;
  micInputStream.on('data', function(data) {
    // console.log("Recieved Input Stream: " + data.length);
    const chunk = data;
    let silenceLength = 0;

    // source: https://npmdoc.github.io/node-npmdoc-mic/build/apidoc.html
    for(i=0; i<chunk.length; i=i+2) {
      var speechSample = 0;
      if(chunk[i+1] > 128) {
          speechSample = (chunk[i+1] - 256) * 256;
      } else {
          speechSample = chunk[i+1] * 256;
      }
      // speechSample += chunk[i];

      // about 8000 is the limit for the initial microphone pop
      // speech is a number below -2000 and above 2000
      // bg noise (computer fans) usually runs around +- 0-512, sometimes +- 1000 in noisy rooms
      if(Math.abs(speechSample) < 8000 && Math.abs(speechSample) > 2000) {
        speechData += speechSample;
        // must use DEBUG=norman-listener and --debug flag
        if (argv.debug) {
          debug("Found speech block", speechSample);
        }
        // reset consecutive silence
        consecutiveSilence = 0;
        consecutiveSpeechBlocks++;
        silenceLength = chunk.length/2;
        continue;
      } else {
        // debug('silenceLength', silenceLength, speechSample);
        silenceLength++;

        // Sometimes background noise is greater than the default mic silence listener
        // which doesn't allow mic to emit the silence event.
        // Here we can force the silence to be emitted to the micInputStream
        if(silenceLength >= 6000) {
          micInputStream.emit('silence');
        }
      }
    }
  });

  micInputStream.on('error', function(err) {
    console.log("Error in Input Stream: " + err);
  });

  micInputStream.on('startComplete', function() {
      console.log("Got SIGNAL startComplete");
  });

  micInputStream.on('stopComplete', function() {
    console.log("Got SIGNAL stopComplete");
    console.log("Saved audio");

    if(
      argv.hasOwnProperty('rnnoise') &&
      ['false', 0, 'off'].includes(argv.rnnoise)
    ){
      return;
    }

    console.log("Cleaning up background noise...");
    execSync(`${path.resolve(__dirname)}/../node_modules/rnnoise/examples/rnnoise_demo ${path.resolve(__dirname)}/../resources/output.wav ${path.resolve(__dirname)}/../resources/output.raw`);
    console.log("Done processing audio...");
    execSync(`ffmpeg -y -f s16le -nostats -loglevel 0 -ar 16k -ac 1 -i ${path.resolve(__dirname)}/../resources/output.raw ${path.resolve(__dirname)}/../resources/output.wav`, {stdio: [process.stdin, process.stdout, process.stderr]});
    console.log("Background noise cleanup complete.");
  });

  micInputStream.on('pauseComplete', function() {
    console.log("Got SIGNAL pauseComplete");
  });

  micInputStream.on('resumeComplete', function() {
    console.log("Got SIGNAL resumeComplete");
  });

  micInputStream.on('silence', function() {
    // The smallest utterance that I could make was about 800, the short "i" sound.
    // Given a keyword and a command, we should get a much larger number.
    // Don't stop the mic for insignificant sounds (< 1000).
    if(consecutiveSpeechBlocks <= 1000){
      consecutiveSpeechBlocks = 0;
      return;
    }
    console.log("Got SIGNAL silence");
    console.log("Speech blocks found:", consecutiveSpeechBlocks);
    consecutiveSpeechBlocks = 0;

    micInstance.stop();
  });

  micInputStream.on('stopComplete', function() {
    let recognize = {};
    try {
      const recognizeStream = execSync('npm run pocketsphinx');
      recognize = recognizeStream
        .toString()
        .split('\n\n')[1]
        .replace('\n', '')
        .trim();
    } catch (err){
      console.error("Error recognizing audio from file. Will restart audio to try again.");
      console.error(err);
      process.exit(1);
      startMicInstance();
      return;
    }


    // call recognizer-finished
    const recognizedWord = recognizeWords(recognize, lastMatchTime);
    if(!recognizedWord){
      // restart the mic
      debug('No recognized words');
      startMicInstance();
      return;
    }

    debug('Recognized words:', recognizedWord);

    if (recognizedWord.isActivationWordSpoken && recognizedWord.matchedCommand) {
      if (recognizedWord.biggestKeyCount > 0) {
        lastMatchTime = Date.now();
      }

      if (recognizedWord.matchedCommand !== 'cancel') {
        currentProc = exec(recognizedWord.matchedCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          if(stdout){
            console.log(`${stdout}`);
          }
          if(stderr){
            console.log(`Error: ${stderr}`);
          }
        });

        currentProc.on('exit', (data) => {
          console.log(`Process exited with code ${data}`);
        });
      } else if (recognizedWord.matchedCommand === 'cancel' && currentProc) {
        console.log('cancel command used');
        currentProc.kill();
        currentProc = null;
      } else {
        console.error(`Couldn't spawn process "${recognizedWord.matchedCommand}"`);
      }
    }

    // restart the mic
    startMicInstance();
  });

  micInputStream.on('processExitComplete', function() {
    console.log("Got SIGNAL processExitComplete");
  });
}

fs.watchFile(commandsFile, (curr, prev) => {
  console.log("\x1b[33m%s\x1b[0m", `Commands file changed.`);
  let commandsFileName = commandsFile.split('/');
  commandsFileName = commandsFileName[commandsFileName.length - 1];
  console.log("\x1b[33m%s\x1b[0m", `Processing commands from ${commandsFileName}. Please wait a moment.`);

  try{
    execSync('npm run config:convert');
    console.log("\x1b[33m%s\x1b[0m", 'Done.');
    recognizeWords = reload('./recognizer').recognizeWords;
  } catch(err){
    console.error('Error', err);
    return;
  }
});

function exitHandler(options, exitCode) {
  fs.unwatchFile(commandsFile);
}

//do something when app is closing
process.on('exit', exitHandler);

//catches ctrl+c event
process.on('SIGINT', exitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);

//catches uncaught exceptions
process.on('uncaughtException', exitHandler);

startMicInstance();
