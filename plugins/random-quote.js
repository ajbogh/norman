var request = require('request');
var cheerio = require('cheerio');
var { execSync } = require('child_process');

request({
  uri: "https://www.brainyquote.com/topics/technology",
}, function(error, response, body) {
  var $ = cheerio.load(body);
  var quotes = $('.b-qt');
  var authors = $('.bq-aut');

  var randomNumber = Math.floor(Math.random() * quotes.length);
  var textQuote = $(quotes[randomNumber]).text();
  var textAuthor = $(authors[randomNumber]).text();

  textQuote = textQuote.replace(/"/g, '\\\"');
  textAuthor = textAuthor.replace(/"/g, '\\\"');

  console.log(`Quote #${randomNumber}: ${textQuote} - ${textAuthor}`)
  execSync(`espeak "${textQuote} - ${textAuthor}"`);
});
