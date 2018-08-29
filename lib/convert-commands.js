process.title = 'norman-convert-commands';

const fs = require('fs-extra');
const argv = require('yargs').argv;
const request = require('request');
const lmtool = require('lmtool');
const commands = require('./commands');

const corpusDir = 'resources/corpus';

const keywords = commands.readKeywords();
const corpusFolderExists = fs.existsSync(corpusDir);

// fileName will now be something like 1337
if (!corpusFolderExists){
  fs.mkdirSync(corpusDir);
} else {
  fs.removeSync(`${corpusDir}`);
  fs.mkdirSync(corpusDir);
}
lmtool(Object.keys(keywords), (err, filename) => {
  fs.renameSync(`${filename}.dic`, `${corpusDir}/${filename}.dic`);
  fs.renameSync(`${filename}.lm`, `${corpusDir}/${filename}.lm`);
  fs.renameSync(`${filename}.log_pronounce`, `${corpusDir}/${filename}.log_pronounce`);
  fs.renameSync(`${filename}.sent`, `${corpusDir}/${filename}.sent`);
  fs.renameSync(`${filename}.vocab`, `${corpusDir}/${filename}.vocab`);
  fs.renameSync(`TAR${filename}.tgz`, `${corpusDir}/TAR${filename}.tgz`);
});
