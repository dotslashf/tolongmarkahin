const { logger } = require('firebase-functions');
const { getBookmarkObject, getCommand } = require('./common');
const Twitter = require('../service/twitter');
const Firestore = require('../service/firestore');

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

  const { length, tweets, userId, folderName, text } =
    getBookmarkObject(message);

  try {
    firestore.setUserId(userId);
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

      tweets.forEach(async tweet => {
        const t = await twitter.checkTweetBookmark(tweet.tweetId);
        await firestore.addBookmark(folderName, t);
      });
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

    // add bookmark ke folder default
    tweets.forEach(async tweet => {
      const t = await twitter.checkTweetBookmark(tweet.tweetId);
      await firestore.addBookmark(folderName, t);
      await twitter.sendDirectMessage(
        `${length} bookmark telah ditambahkan ke ${folderName}`
      );
      return;
    });
  } catch (e) {
    logger.error('onEvent', e);
    await twitter.sendDirectMessage({ type: 'error' });
  }
}

module.exports = {
  onEvent,
};
