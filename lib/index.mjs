import Speakable from 'speakable';

const clientId = '347122566814-pi1f1rh5hb7b4qeta30brnpqih6th4su.apps.googleusercontent.com';
const clientSecret = 'tuAr54jygUcAF6TEiFtNUaC2';
const apiKey = 'AIzaSyAJyaRCSSw994erKwMK--JdI5haIPCdbaM';

var speakable = new Speakable({key: apiKey});

speakable.on('speechStart', function() {
  console.log('onSpeechStart');
});
 
speakable.on('speechStop', function() {
  console.log('onSpeechStop');
});
 
speakable.on('speechReady', function() {
  console.log('onSpeechReady');
});
 
speakable.on('error', function(err) {
  console.log('onError:');
  console.log(err);
  speakable.recordVoice();
});
 
speakable.on('speechResult', function(recognizedWords) {
  console.log('onSpeechResult:')
  console.log(recognizedWords);
  speakable.recordVoice();
});
 
speakable.recordVoice();
