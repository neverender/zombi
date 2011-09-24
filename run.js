var bot = require('./lib/zombi.js');
var util = require('util');

var zombi = new bot.zombi();

//console.log(util.inspect(zombi));
zombi.connect();