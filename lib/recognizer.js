const argv = require('yargs').argv;
const keywords = require('./commands').readKeywords();

/**
 * argv options:
 *   keywordTimeLimit: number of seconds before the keyword times out (default 0)
 *   matchPercentage: a number from 0-1 of how many words must match (default 0.75)
 */

function recognizeWords(msg, lastMatchTime) {
  const t = msg.toLowerCase();
  const recognizedWordsArray = t.split(" ");

  return searchForMatches(recognizedWordsArray, lastMatchTime);
}

function intersection(array1, array2) {
  return array1.filter(value => -1 !== array2.indexOf(value));
}

/**
 *
 * @param {*} recognizedWordsArray - An array of recognized words
 * @param {*} lastMatchTime - The number of seconds since a match was last made
 */
function searchForMatches(recognizedWordsArray, lastMatchTime) {
  const currentTime = Date.now();
  lastMatchTime = lastMatchTime || Date.now();
  const keywordTimeLimit = argv.keywordTimeLimit ? parseInt(argv.keywordTimeLimit) : 0;
  const matchPercentage = argv.matchPercentage ? parseFloat(argv.matchPercentage) : 0.75;
  const timeSinceLastMatch = currentTime - lastMatchTime;

  const response = {
    matchedKey: null,
    matchedCommand: null,
    recognizedWords: recognizedWordsArray,
    timeSinceLastMatch,
    keywordTimeLimit,
    isActivationWordSpoken: keywordTimeLimit > 0 && (timeSinceLastMatch < keywordTimeLimit),
    activationWordMatches: []
  };

  // let matchLimit = 1;

  const keywordsArray = Object.keys(keywords);

  // Some words are 'activationWords' or key phrases,
  // we call this a 'keyword'.
  // Normally one of these activation words must be spoken.
  // If keywordTimeLimit is greater than 0 then
  // the user doesn't need the keyword as long as they spoke it
  // within the keywordTimeLimit.
  const activationWords = keywordsArray.filter(key => keywords[key] === 'keyword');

  // commandKeys are config items which are not keywords
  const commandKeys = keywordsArray.filter(key => keywords[key] !== 'keyword');

  // check if the activationWord was spoken
  // it was if the keywordTimeLimit is not met yet
  for (let i = 0; i < activationWords.length; i++){
    const activationWord = activationWords[i];
    // split the activation word on spaces
    const activationWordArray = activationWord.split(/[ -_]/);
    const activationWordMatches = intersection(activationWordArray, recognizedWordsArray);
    if (activationWordMatches.length > response.activationWordMatches.length) {
      // save the activationWordMatches to the response so that we can calculate the
      // match percentage of the command phrase later
      response.activationWordMatches = activationWordMatches;
    }
    if (!response.isActivationWordSpoken) {
      response.isActivationWordSpoken = activationWordMatches.length >= activationWordArray.length;
    }
  }

  // Figure out which command was spoken
  // If more words were heard then only accept the command if >75% of the
  // words match.
  let largestCommandKeyMatches = [];
  let largestCommandKey = null;
  for (let i = 0; i < commandKeys.length; i++) {
    const commandKey = commandKeys[i];
    const commandKeyArray = commandKey.split(/[ -_]/);
    const commandKeyMatches = intersection(commandKeyArray, recognizedWordsArray);
    if (
      commandKeyMatches.length === commandKeyArray.length &&
      commandKeyMatches.length > largestCommandKeyMatches.length
    ) {
      largestCommandKey = commandKey;
      largestCommandKeyMatches = commandKeyMatches;
    }
  }

  // determine if the keyword spoken has weight
  if (
    largestCommandKeyMatches.length &&
    recognizedWordsArray.length >= largestCommandKeyMatches.length &&
    largestCommandKeyMatches.length / (recognizedWordsArray.length - response.activationWordMatches.length) > matchPercentage
  ) {
    // we have a match and it carries weight
    response.matchedKey = largestCommandKey;
    response.matchedCommand = keywords[response.matchedKey];
  }

  return response;
}

module.exports = {
  intersection,
  recognizeWords,
  searchForMatches
}
