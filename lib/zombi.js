var fs = require('fs');

var zombi = function() {

  this.config = JSON.parse(fs.readFileSync(__dirname + '/../config.js', 'utf8'));
  this.executedOn = new Date();

}

zombi.prototype.connect = function() {
  this.chat = require(__dirname + '/backends/' + this.config.backend + '.js');
  this.chat.connect(this.config);
}

exports.zombi = zombi;