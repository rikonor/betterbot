var slackbot = require('node-slackbot');

function BetterBot(botToken, botId) {
  this.botToken = botToken;
  this.botId = botId;

  // Use node-slackbot as api client
  this.bot = new slackbot(this.botToken);
  this.bot.use(this.handleEvent.bind(this));

  this.handlers = [this.defaultHandler];
}

BetterBot.prototype.sendMessage = function(channel, message) {
  this.bot.sendMessage(channel, message);
};

// Cute function to have - given a message, check if the user is mentioned
// Or give back a list of the mentioned users
// So not as it's implemented right now because that's just based on the userId
// In a cooler scenario you would parse the message for userIds and make an api call for each
// getting his name, then you can get a list of all user names
BetterBot.prototype.mentionsUser = function(message, userId) {
  return message.indexOf('<@' + userId + '>') !== -1;
};

// Check that the message is for pomodoro
BetterBot.prototype.isMessageForMe = function(message) {
  // checks if the message addresses the bot
  return this.mentionsUser(message, this.botId);
};

BetterBot.prototype.getUserInfo = function(userId, cb) {
  this.bot.api('users.info', {user: userId}, function(res) {
    cb(res.user);
  });
};

BetterBot.prototype.getUserName = function(userId, cb) {
  this.getUserInfo(userId, function(userInfo) {
    cb(userInfo.real_name || res.user.name);
  });
};

BetterBot.prototype.parseMessage = function(message) {
  // Given a message, try to give back a command and it's arguments
  fields = message.split(' ')
  return {
    cmd: fields[0],
    args: fields.slice(1)
  }
}

BetterBot.prototype.defaultHandler = function(message) {
  var self = this;

  if (self.isMessageForMe(message.text)) {
    self.getUserName(message.user, function(userName) {
      var msgToSend = "Hi, " + userName + ". What's up?"
      self.sendMessage(message.channel, msgToSend);
    });
  }
}

BetterBot.prototype.addHandler = function(handler) {
  // Remove the default handler
  if ((this.handlers[0]) === this.defaultHandler) {
    this.handlers.shift();
  }

  this.handlers.push(handler);
};

BetterBot.prototype.handleEvent = function(evt, cb) {
  if (evt.type === 'message') {
    this.handlers.forEach(function(handler) {
      handler(evt);
    });
  }
  cb();
};

BetterBot.prototype.start = function() {
  console.log("Starting bot");
  this.bot.connect();
}

module.exports = BetterBot;
