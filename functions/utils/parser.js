const { logger } = require('firebase-functions');
const {
  getBookmarkObject,
  getCommand,
  getSetConfigCommand,
  formatJson,
} = require('./common');
const Twitter = require('../service/twitter');
const Firestore = require('../service/firestore');
const bcrypt = require('bcrypt');

/**
 *
 * @param {Firestore} firestore | Firestore object class
 * @param {*} body
 * @returns
 */
async function onEvent(firestore, body) {
  const { direct_message_events } = body;
  if (!direct_message_events || direct_message_events.length === 0) {
    return;
  }

  const twitter = new Twitter();
  const message = twitter.getLastMessage(direct_message_events);

  let { length, tweets, userId, folderName, text } = getBookmarkObject(message);

  try {
    firestore.setUserId(userId);
    const isFirstTime = await firestore.isFirstTime();
    if (isFirstTime) {
      await firestore.createConfig();
    }
    const config = await firestore.getConfig();
    folderName = folderName || config.defaultFolder;
    const command = getCommand(text);

    // reject non command
    if (command === null && length === 0) {
      return;
    }

    // buat folder baru
    if (['/createFolder', '/buatFolder'].includes(command)) {
      const isFolderExist = await firestore.isFolderExist(folderName);
      if (folderName === 'general') {
        return twitter.sendMessage({
          type: 'error',
        });
      }
      if (isFolderExist) {
        return twitter.sendDirectMessage({
          type: 'folderExist',
          folderName,
        });
      }
      await firestore.createFolder(folderName);
      await twitter.sendDirectMessage({
        type: 'tambahFolder',
        folderName,
      });
      return;
    }

    // add bookmark ke folder
    if (['/ke', '/to'].includes(command)) {
      const isFolderExist = await firestore.isFolderExist(folderName);
      if (!isFolderExist) {
        await firestore.createFolder(folderName);
        await twitter.sendDirectMessage({
          type: 'tambahFolder',
          folderName,
        });
      }

      await Promise.all(
        tweets.map(async tweet => {
          const t = await twitter.checkTweetBookmark(tweet.tweetId);
          await firestore.addBookmark(folderName, t);
        })
      );
      await twitter.sendDirectMessage({
        type: 'tambahBookmark',
        length,
        folderName,
      });
      return;
    }

    // list commands
    if (['/help'].includes(command)) {
      await twitter.sendDirectMessage({ type: 'help' });
      return;
    }

    if (['/getConfig'].includes(command)) {
      await twitter.sendDirectMessage({
        type: 'config',
        text: formatJson(config),
      });
    }

    if (['/setConfig'].includes(command)) {
      const isCorrectFormat = text.split(' ').length === 3;
      if (!isCorrectFormat) {
        return twitter.sendDirectMessage({
          type: 'error',
          text: 'format salah',
        });
      }
      let { command, value } = getSetConfigCommand(text);
      if (command === 'password') {
        value = await bcrypt.hash(value, 10);
      }
      const update = { [command]: value };
      await firestore.setConfig(update);
      const updatedConfig = await firestore.getConfig();
      await twitter.sendDirectMessage({
        type: 'config',
        text: formatJson(updatedConfig),
      });
    }

    // add bookmark ke folder default
    await Promise.all(
      tweets.map(async tweet => {
        const t = await twitter.checkTweetBookmark(tweet.tweetId);
        await firestore.addBookmark(folderName, t);
        return;
      })
    );
    await twitter.sendDirectMessage({
      type: 'tambahBookmark',
      folderName,
      length,
    });
  } catch (e) {
    logger.error('onEvent', e);
    await twitter.sendDirectMessage({ type: 'error' });
  }
}

module.exports = {
  onEvent,
};
