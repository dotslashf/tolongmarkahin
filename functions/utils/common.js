const crypto = require('crypto');

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
  const commands = [
    '/createFolder',
    '/buatFolder',
    '/+folder',
    '/ke',
    '/keFolder',
  ];
  return commands.filter(c => {
    const re = new RegExp(`^${c.replace(/([+?])/g, '\\$1')} `);
    return text.match(re);
  })[0];
}

module.exports = {
  validateSignature,
  getBookmarkObject,
  getCommand,
};
