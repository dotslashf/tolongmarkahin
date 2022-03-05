const crypto = require('crypto');

function fixChar(obj) {
  return JSON.stringify(obj).replace(/\//g, '\\/');
}

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
      .update(fixChar(body))
      .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(header[signatureHeaderName]),
    Buffer.from(signature)
  );
}

module.exports = {
  validateSignature,
};
