var fs = require('fs');
var xmpp = require('node-xmpp');

var zombi = function() {
  this.config = JSON.parse(fs.readFileSync(__dirname + '/../config.js', 'utf8'));
  this.verbose = (this.config.verbose) ? true : ((typeof this.config.verbose != 'undefined') ? this.config.verbose : false);
  this.executedOn = new Date();
}

zombi.prototype.connect = function() {
  
  this.conference = "conference.#{this.config.username.split('@')[1]}"
  var chat = new xmpp.Client({jid: this.config.username, password: this.config.password});

  chat.on('online', function() {
    chat.send(new xmpp.Element('presence', { }).
      c('show').t('chat').up().
      c('status').t('zombi online')
    );
  });  

  chat.on('stanza', function(stanza) {
    if (stanza.is('message') &&
      // Important: never reply to errors!
      stanza.attrs.type !== 'error') {
        //console.log(stanza);
      // Swap addresses...
      stanza.attrs.to = stanza.attrs.from;
      delete stanza.attrs.from;
      // and send back.
      chat.send(stanza);
    }
  });

  chat.on('error', function(e) {
    sys.puts(e);
  });

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

zombi.prototype.speak = function(message) {
  // body...
};

exports.zombi = zombi;