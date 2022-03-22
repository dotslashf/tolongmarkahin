const Twit = require('twit');
const { formatCommandsHelp } = require('../utils/common');
require('dotenv').config();

class Twitter {
  constructor() {
    this.client = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });
    this.userId = null;
  }

  setRecipientId(userId) {
    this.userId = userId;
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

    this.setRecipientId(message.message_create.sender_id);

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

  sendDirectMessage({ type, folderName, length, text }) {
    let msg = '';
    switch (type) {
      case 'tambahFolder':
        msg = `✨ folder ${folderName} berhasil ditambahkan`;
        break;
      case 'folderExist':
        msg = `🤔 folder ${folderName} sudah ada, gak mungkin double dong`;
        break;
      case 'tambahBookmark':
        msg = `✨ ${length} bookmark telah ditambahkan ke ${folderName}`;
        break;
      case 'help':
        msg = `🔮 List command:\n\n${formatCommandsHelp()}`;
        break;
      case 'config':
        msg = `⚙️ Config: \n\n${text}`;
        break;
      case 'error':
        msg = text
          ? `💀 terjadi kesalahan: \n${text}\n\n silahkan kirim pesan error ini ke @dotslashf / @mockdotexe`
          : '💀 terjadi kesalahan';
        break;
      case 'firstTime':
        msg = `🤖 Hi, ${text}!\n\nTerimakasih telah mencoba tolongmarkahin.\n\nSilahkan login menggunakan username dan password pada konfigurasi awal.\n\nBerikut adalah konfigurasi awal:`;
        break;
      case 'follow':
        msg = `🤖 Terimakasih telah mengikuti tolongmarkahin.`;
        break;
      case 'listFolder':
        msg = `📂 List folder: \n\n${text} \n\nfolder dengan emoji ✨ adalah folder default`;
        break;
    }

    return new Promise((resolve, reject) => {
      this.client.post(
        'direct_messages/events/new',
        {
          event: {
            type: 'message_create',
            message_create: {
              target: {
                recipient_id: this.userId,
              },
              message_data: {
                text: msg,
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

  getUserProfile(userId) {
    return new Promise((resolve, reject) => {
      this.client.get(
        'users/show',
        {
          user_id: userId,
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
