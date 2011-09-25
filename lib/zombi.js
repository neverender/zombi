var fs = require('fs');
var xmpp = require('node-xmpp');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var zombi = function() {
  this.config = JSON.parse(fs.readFileSync(__dirname + '/../config.js', 'utf8'));
  this.verbose = (this.config.verbose) ? true : ((typeof this.config.verbose != 'undefined') ? this.config.verbose : false);
  this.executedOn = new Date();
  this.rooms = []
  
  var self = this;
  this.config.rooms.forEach(function(room){
    self.addRoom(room);
  });
}

zombi.prototype.connect = function() {
  var self = this;
  
  this.conference = "conference.#{this.config.username.split('@')[1]}"
  this.chat = new xmpp.Client({jid: this.config.username, password: this.config.password});

  this.chat.on('online', function() {
    self.chat.send(new xmpp.Element('presence', { }).
      c('show').t('chat').up().
      c('status').t('zombi online')
    );
    if(self.verbose) {
      console.log('zombie online');
    }
  });  

  this.chat.on('stanza', function(stanza) {
    if(stanza.is('message') && stanza.attrs.type != 'error' && !self.fromMe(stanza)) {
      self.parse(stanza);
    }
  });

  this.chat.on('error', function(e) {
    console.log(e);
  });

}

zombi.prototype.addRoom = function(room) {
  var room = room.toLowerCase()
  if(this.rooms.indexOf(room) === -1) {
    this.rooms.push(room);
  };
}

zombi.prototype.fromMe = function(stanza) {
  var self = this;
  this.rooms.forEach(function(room){
    if(stanza.attrs.from == room + '@' + self.conference + '/' + self.config.nickname) {
      return true;
    }
  return false;
  });
};

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

zombi.prototype.speak = function(message, stanza) {
  if(stanza.attrs.type === 'groupchat') {
    var room = stanza.attrs.from.split('/')[0];
    var msg  = new xmpp.Element('message', {to: room, type: 'groupchat'}).c('body').t(message);
  } else {
    var msg = new xmpp.Element('message', {to: stanza.attrs.from, type: 'chat'}).c('body').t(message);
    this.chat.send(msg);
  }
};

zombi.prototype.parse = function(stanza) {
  var self = this;
  parser.parseString(stanza.toString());

  parser.once('end', function(result) {
    var body = result['body'];
    
    if(result['delay'] == null && body != null ) {
      self.speak('hi', stanza);
    }
  });
}

exports.zombi = zombi;