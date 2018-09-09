process.title = 'norman-listener';

const argv = require('yargs').argv;
var debug = require('debug')('norman-listener');
var fs = require('fs');
var mic = require('mic');
var path = require('path');
const { execSync, exec } = require('child_process');
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

      // about 8000 is the limit for background noise, and speech is a number from 
      // around -2000 to 2000
      if(speechSample < 7000 && Math.abs(speechSample) > 2000) {
        speechData += speechSample;
        // if (debug) {
        debug("Found speech block", speechSample);
        // }
        // reset consecutive silence
        consecutiveSilence = 0;
        consecutiveSpeechBlocks++;
        silenceLength = chunk.length/2;
        continue;
      } else {
        debug('silenceLength', silenceLength);
        silenceLength++;
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
    console.log("Speech blocks found:", consecutiveSpeechBlocks);
    if(consecutiveSpeechBlocks <= 1){
      consecutiveSpeechBlocks = 0;
      return;
    }
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
      startMicInstance();
      return;
    }
    

    // call recognizer-finished
    const recognizedWord = recognizeWords(recognize, lastMatchTime);
    if(!recognizedWord){
      // restart the mic
      startMicInstance();
      return;
    }

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

startMicInstance();
