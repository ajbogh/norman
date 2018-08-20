var fs = require('fs');
var mic = require('mic');
var path = require('path');
var shell = require('shelljs');
 
// var micInstance = mic({
//   device: 'default',
//   channels: 1,
//   // debug: true,
//   exitOnSilence: 6
// });
// var micInputStream = micInstance.getAudioStream();
 
// var outputFileStream = fs.WriteStream(`${path.resolve(__dirname)}/../resources/output.raw`);
// micInputStream.pipe(outputFileStream);

function startMicInstance(){
  var micInstance = mic({
    device: 'default',
    channels: 1,
    // debug: true,
    exitOnSilence: 6
  });
  var micInputStream = micInstance.getAudioStream();
   
  var outputFileStream = fs.WriteStream(`${path.resolve(__dirname)}/../resources/output.raw`);
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
        silenceLength++;
      }

    }
    if(silenceLength == chunk.length/2) {
        consecutiveSilence += 1;
        // if (debug) {
          // console.log("Found silence block: %d of %d", consecutiveSilence, numSilenceFramesExitThresh);
        // }
        //emit 'silence' only once each time the threshold condition is met
        if( consecutiveSilence === numSilenceFramesExitThresh) {
          // self.emit('silence');
          speechData = '';
          micInstance.stop();
          outputFileStream.close();
          console.log("Saved audio");
        }
    }
  });

  micInputStream.on('error', function(err) {
    console.log("Error in Input Stream: " + err);
  });
   
  micInputStream.on('startComplete', function() {
      console.log("Got SIGNAL startComplete");
      // setTimeout(function() {
      //   micInstance.pause();
      // }, 5000);
  });
      
  micInputStream.on('stopComplete', function() {
    console.log("Got SIGNAL stopComplete");
  });
      
  micInputStream.on('pauseComplete', function() {
    console.log("Got SIGNAL pauseComplete");
    // setTimeout(function() {
    //   micInstance.resume();
    // }, 5000);
  });
   
  micInputStream.on('resumeComplete', function() {
    console.log("Got SIGNAL resumeComplete");
    // setTimeout(function() {
    //   micInstance.stop();
    // }, 5000);
  });
   
  micInputStream.on('silence', function() {
    console.log("Got SIGNAL silence");
    console.log(shell.exec('npm run google'));
    setTimeout(startMicInstance, 3000);
  });
   
  micInputStream.on('processExitComplete', function() {
    console.log("Got SIGNAL processExitComplete");
  });
}

startMicInstance();
