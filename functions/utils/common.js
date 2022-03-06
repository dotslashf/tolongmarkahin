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

function getBookmarkUrls(message) {
  const urls = message.message_create.message_data.entities.urls;
  return {
    length: urls.length,
    urls: urls.map(url => url.expanded_url),
  };
}

function getCommand(message) {
  const text = message.message_create.message_data.text;
  console.log(text);
  const commands = ['/addFolder', '/tambahFolder'];
  return commands.filter(c => {
    const re = new RegExp(`^${c} `);
    return text.match(re);
  })[0];
}

module.exports = {
  validateSignature,
  getBookmarkUrls,
  getCommand,
};
