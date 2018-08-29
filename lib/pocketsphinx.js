process.title = 'norman-pocketsphinx';

const fs = require('fs');
var exec = require('child_process').exec;

const corpusPath = 'resources/corpus';

const files = fs.readdirSync(corpusPath);
const dicFile = files.find((file) => {
  const components = file.split('.');
  return (components.length == 2 && components[1] === 'dic');
});
if (!dicFile) {
  throw "No dictionary file found! Run config:convert first.";
}

const prefix = dicFile.split('.')[0];

if (!fs.existsSync('./resources/output.raw')) {
  throw "No output.raw file found! Run listener first.";
}

// run process for pocketsphinx_continuous
const command = `./node_modules/pocketsphinx/bin/pocketsphinx_continuous -infile ./resources/output.raw -lm ./resources/corpus/${prefix}.lm -dict ./resources/corpus/${prefix}.dic`;
exec(command, (error, stdout, stderr) => {
  if (error) {
    throw error;
  }

  process.stdout.write(stdout);
});
