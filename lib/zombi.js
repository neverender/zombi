var fs = require('fs');
var xmpp = require('node-xmpp');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var zombi = function() {
  this.config = JSON.parse(fs.readFileSync(__dirname + '/../config.js', 'utf8'));
  this.verbose = (this.config.verbose) ? true : ((typeof this.config.verbose != 'undefined') ? this.config.verbose : false);
  this.executedOn = new Date();
  this.rooms = [];
  this.messageHandlers = [];
  this.pluginNameRef = [];
  this.plugins = [];
  
  var self = this;
  this.config.rooms.forEach(function(room){
    self.addRoom(room);
  });
}

zombi.prototype.connect = function() {
  var self = this;
  
  this.loadPlugins();

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
  var self = this;
  if (typeof dir === "undefined") {
    var dir = '/plugins';
    fs.readdir(__dirname + '/..' + dir, function(err, files) {

      if(err) {
        return;
      }
      files.forEach(function(file) {
        if(file.indexOf(".js") != -1) {
          var pluginName = file.replace(/.js/, '');
          var filename = __dirname + '/..' + dir + '/' + file;

          self.loadPlugin(pluginName, filename);
          //Plugin happens to be stored within a subdirectory, traverse that.
        } else {
          self.loadPlugins(dir + "/" + file);
        }
      });
    });
  }
}

zombi.prototype.addMessageHandler = function(plugin) {
  this.messageHandlers.push(plugin);
};

zombi.prototype.loadPlugin = function(pluginName, filename) {
    try {
      var plugin = require(filename);
      var command = new plugin.Command();
      this.addPlugin(pluginName, filename, command);
      if(this.verbose) {
        console.log("Loaded plugin: " + pluginName);
      }
    }
    
    catch(err) {
      console.log("There was a problem loading the plugin: " + filename);
    }
};


zombi.prototype.addPlugin = function(pluginName, filename, plugin) {
  if(typeof this.plugins[filename] == 'undefined') {
    this.plugins[filename] = {};
    this.pluginNameRef[plugin.name] = pluginName;
    this.plugins[filename].plugin = plugin;
    this.plugins[filename].mtime = null;

    this.addMessageHandler(plugin);
  }
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
      for (i = 0, self.messageHandlers.length; i < self.messageHandlers.length; i++) {
        var handler = self.messageHandlers[i];

        var pluginName = self.pluginNameRef[handler.name];
        if(typeof(handler.regex) === 'function') {
          
          if(stanza.attrs.type === 'groupchat') {
            var regstring = handler.regex.toString().replace(/^\//, '');
            var regstring = regstring.toString().replace(/\/$/, '');
            var regex = new RegExp("bot[,: ] " + regstring + "|bot " + regstring, 'i');
            var regex2 = new RegExp(self.nickname + "[,: ] " + regstring + "|" + self.nickname + regstring, 'i');
          } else {
            var regex = handler.regex
          }

          var match = false;
          
          if(body.match(regex) || body.match(regex2)) {
            match = true;
          }
          
          if(match === false) {
            continue;
          }

        } else {
          var foundMatch = false;
          for (i = 0, handler.regex.length; i < handler.regex.length; i++) {
            var regex = handler.regex[i];
            if(!body.match(regex)) {
              continue;
            } else {
              foundMatch = true;
            }
          }
          if(!foundMatch) {
            continue;
          }
        }
              
        if(self.verbose) {
          console.log('matched: ' + handler.name)
        }
        
        handler.callback(body, stanza, self);
      }
    }
  });
}

exports.zombi = zombi;