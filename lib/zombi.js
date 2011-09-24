var fs = require('fs');

var zombi = function() {

  this.config = JSON.parse(fs.readFileSync(__dirname + '/../config.js', 'utf8'));
  this.executedOn = new Date();

}

zombi.prototype.connect = function() {
  this.chat = require(__dirname + '/backends/' + this.config.backend + '.js');
  this.chat.connect(this.config);
}

zombi.prototype.loadPlugins = function(dir) {
  
}

zombi.prototype.addMessageHandler = function(plugin) {
  // body...
};

zombi.prototype.loadPlugin = function(pluginName, filename) {
  // body...
};


zombi.prototype.addPlugin = function(pluginName, filename, plugin) {
  // body...
};

exports.zombi = zombi;