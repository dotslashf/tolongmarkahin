const functions = require('firebase-functions');
const crypto = require('crypto');

const config = {
  consumer_secret: functions.config().twitter.consumer_secret,
};

exports.webhook = functions.https.onRequest((req, res) => {
  if (req.method === 'GET') {
    const crcToken = req.query.crc_token;

    if (!crcToken) {
      return res
        .status(400)
        .json({ error: 'Missing query parameter crc_token' });
    }

    const hmac = crypto
      .createHmac(
        'sha256',
        'Z5jA8DrBijrR0p3BtnU6H3ZfqITBaMk7DVLKu7yfcv3dIgfDl3'
      )
      .update(crcToken)
      .digest('base64');

    return res.status(200).json({
      response_token: `sha256=${hmac}`,
    });
  }
  if (req.method === 'POST') {
    console.log(req.body);
    return res.status(200).json({ status: 'OK' });
  }
});
