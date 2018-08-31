process.title = 'norman-listener';

const argv = require('yargs').argv;
var debug = require('debug')('norman-listener');
var fs = require('fs');
var mic = require('mic');
var path = require('path');
const { execSync, spawn } = require('child_process');
const { recognizeWords } = require('./recognizer');

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
  let speechData = '';
  micInputStream.on('data', function(data) {
    // console.log("Recieved Input Stream: " + data.length);
    const chunk = data;
    let silenceLength = 0;

    // source: https://npmdoc.github.io/node-npmdoc-mic/build/apidoc.html
    for(i=0; i<chunk.length; i=i+2) {
      debug('got data');
      var speechSample = 0;
      if(chunk[i+1] > 128) {
          speechSample = (chunk[i+1] - 256) * 256;
      } else {
          speechSample = chunk[i+1] * 256;
      }
      speechSample += chunk[i];

      if(Math.abs(speechSample) > 2000) {
        speechData += speechSample;
        // if (debug) {
        console.log("Found speech block");
        // }
        // reset consecutive silence
        consecutiveSilence = 0;
        silenceLength = chunk.length/2;
        break;
      } else {
        debug('silenceLength', silenceLength);
        silenceLength++;
      }
    }

    // if half of the data is silence, assume it all is
    if(silenceLength == chunk.length / 2) {
      debug("detected silence")
      consecutiveSilence += 1;
      //emit 'silence' only once each time the threshold condition is met
      if(speechData !== '' && consecutiveSilence === numSilenceFramesExitThresh) {
        // self.emit('silence');
        console.log("stopping mic");
        speechData = '';
        micInstance.stop();
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
  });

  micInputStream.on('pauseComplete', function() {
    console.log("Got SIGNAL pauseComplete");
  });

  micInputStream.on('resumeComplete', function() {
    console.log("Got SIGNAL resumeComplete");
  });

  micInputStream.on('silence', function() {
    console.log("Got SIGNAL silence");
    const recognizeStream = execSync('npm run pocketsphinx');
    const recognize = recognizeStream
      .toString()
      .split('\n\n')[1]
      .replace('\n', '')
      .trim();

    // call recognizer-finished
    const recognizedWord = recognizeWords(recognize, lastMatchTime);
    if (recognizedWord.biggestKeyCount > 0) {
      lastMatchTime = Date.now();
    }
    if (recognizedWord.isActivationWordSpoken && recognizedWord.matchedCommand) {
      const spawnArray = recognizedWord.matchedCommand.split(' ');
      if (spawnArray.length && recognizedWord.matchedCommand !== 'cancel') {
        currentProc = spawn(spawnArray[0], spawnArray.slice(1));

        currentProc.stdout.on('data', (data) => {
          console.log(`${data}`);
        });

        currentProc.stderr.on('data', (data) => {
          console.log(`${data}`);
        });
      } else if (recognizedWord.matchedCommand === 'cancel' && currentProc) {
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

startMicInstance();
