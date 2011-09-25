/**
 * zombi plugin to respond to a 'ping'.
 *
 */
function Command() {
  this.name = "ping";
  this.regex = /ping/;
  this.description = "Respond to a ping.";
  this.callback = function(body, stanza, zombi) {
    zombi.speak('pong', stanza);
  }
};

exports.Command = Command;