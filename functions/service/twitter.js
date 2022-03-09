const Twit = require('twit');
const { logger } = require('firebase-functions');
require('dotenv').config();

class Twitter {
  constructor() {
    this.client = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });
  }

  getLastMessage(direct_message_events) {
    const message = direct_message_events.shift();

    if (
      typeof message === 'undefined' ||
      typeof message.message_create === 'undefined'
    ) {
      return reject(new Error('Invalid message'));
    }

    if (
      message.message_create.sender_id ===
      message.message_create.target.recipient_id
    ) {
      return reject(new Error('Dont reply to yourself'));
    }

    return message;
  }

  checkTweetBookmark(tweetId) {
    return new Promise((resolve, reject) => {
      this.client.get(
        'statuses/show',
        {
          id: tweetId,
          include_entities: true,
          tweet_mode: 'extended',
        },
        (err, data) => {
          if (err) {
            console.error(err);
            return reject(err);
          }
          return resolve(data);
        }
      );
    });
  }

  sendDirectMessage(userId, messageText) {
    return new Promise((resolve, reject) => {
      this.client.post(
        'direct_messages/events/new',
        {
          event: {
            type: 'message_create',
            message_create: {
              target: {
                recipient_id: userId,
              },
              message_data: {
                text: messageText,
              },
            },
          },
        },
        (err, data) => {
          if (err) {
            console.error(err);
            return reject(err);
          }
          return resolve(data);
        }
      );
    });
  }
}

module.exports = Twitter;
