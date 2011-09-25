# zombi

zombi is a simple extensible bot for Jabber.

# Requirements

* A valid [Jabber](http://www.jabber.org/) account.
* [Node.js](http://nodejs.org) >= 0.4.7
* [node-xmpp](https://github.com/astro/node-xmpp/)
* [node-xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)

# Running zombi

Copy `config.js-dist` over to `config.js` and edit in the appropriate values for your Jabber account.

* `username` is the user and domain of your account.
* `password` is the password of the user you want to act as your bot.
* `rooms` is an array of the rooms you want to connect to. If you want to connect to 'main' and 'non-main' it would be ['main', 'non-main']

Run zombi:

    node run.js

# Plugins

zombi is controlled via plugins in `/plugins`, and as such, has an easy to use plugin interface.

Plugins consist of a singular function with a command that consists of at least three variables:

1. `name` - Name of the plugin.
2. `regex` - Regex applied to messages to capture and execute this command. This can be an array of regular expressions if your plugin requires multiple triggers.
3. `callback` - Code to execute for this command.

The order of arguments for the callback are as such:

* `body` - The regex matched message body
* `stanza` - The stanza object as returned from XMPP.
* `zombi` - The instance zombi object.

The following is a simple plugin to respond to "ping" with "pong".

    /**
     * zombi plugin to respond to a 'ping'.
     *
     */
    function Command() {
      this.name = "ping";
      this.regex = /ping/;
      this.description = "Respond to a ping.";
      this.callback = function(body, stanza, zombi) {
        zombi.say('pong', stanza);
      }
    };

    exports.Command = Command;

Simple.

# Mentions

* A majority of the code surrounding how plugins work was borrowed from https://github.com/jonursenbach/node-smores which borrowed a lot from https://github.com/indiefan/nodebot
* https://github.com/jmazzi/red was also very helpful