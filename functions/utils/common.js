const crypto = require('crypto');
const { commands } = require('../constants/index');

function validateSignature(header, body) {
  const signatureHeaderName = 'x-twitter-webhooks-signature';

  if (typeof header[signatureHeaderName] === 'undefined') {
    throw new TypeError(
      `validateSignature: header ${signatureHeaderName} not found`
    );
  }

  const signature =
    'sha256=' +
    crypto
      .createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET)
      .update(body.toString())
      .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(header[signatureHeaderName]),
    Buffer.from(signature)
  );
}

function getBookmarkObject(message) {
  const urls = message.message_create.message_data.entities.urls;
  const userId = message.message_create.sender_id;
  const folderName = message.message_create.message_data.text.split(' ')[1];
  const text = message.message_create.message_data.text;
  return {
    length: urls.length,
    userId,
    folderName: folderName ? folderName : 'general',
    text,
    tweets: urls.map(url => {
      return {
        url: url.expanded_url,
        tweetId: url.expanded_url.match(/status\/(\d*)/)[1],
      };
    }),
  };
}

function getCommand(text) {
  const command = text.split(' ')[0];
  const resultCommand = commands.filter(c => {
    const re = new RegExp(`(^${c.command}$)`, 'm');
    return command.match(re);
  })[0];
  return resultCommand ? resultCommand.command : null;
}

function formatCommandsHelp() {
  return commands
    .map(
      c =>
        `💡 ${c.command}${c.help !== '' ? `\n❓ ${c.help}` : ''}\nℹ️ ${
          c.description
        }`
    )
    .join('\n\n');
}

module.exports = {
  validateSignature,
  getBookmarkObject,
  getCommand,
  formatCommandsHelp,
};
