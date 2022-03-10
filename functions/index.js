const functions = require('firebase-functions');
const crypto = require('crypto');
const { onEvent } = require('./utils/parser');
const { validateSignature } = require('./utils/common');
const Firestore = require('./services/firestore');
require('dotenv').config();

const firestore = new Firestore();
firestore.init();

exports.webhook = functions.https.onRequest((req, res) => {
  if (req.method === 'GET') {
    const crcToken = req.query.crc_token;

    if (!crcToken) {
      return res
        .status(400)
        .json({ error: 'Missing query parameter crc_token' });
    }

    const hmac = crypto
      .createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET)
      .update(crcToken)
      .digest('base64');

    return res.status(200).json({
      response_token: `sha256=${hmac}`,
    });
  }

  if (req.method === 'POST') {
    try {
      if (!validateSignature(req.headers, req.rawBody)) {
        console.error('Invalid signature');
        return;
      }
    } catch (e) {
      console.error(e);
    }

    onEvent(firestore, req.body);
    return res.status(200).json({ status: 'Ok' });
  }
});
