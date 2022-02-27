const express = require('express');
const crypto = require('crypto');
const { onEvent } = require('./functions/utils/parser');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/webhook/twitter', function (req, res) {
  const crcToken = req.query.crc_token;

  if (!crcToken) {
    return res.status(400).json({ error: 'Missing query parameter crc_token' });
  }

  const hmac = crypto
    .createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET)
    .update(crcToken)
    .digest('base64');

  return res.status(200).json({
    response_token: `sha256=${hmac}`,
  });
});

app.post('/webhook/twitter', function (req, res) {
  onEvent(req.body);
  return res.status(200).json({ status: 'OK' });
});

app.listen(3000, async () => {
  console.log('Listening on port 3000');
});
