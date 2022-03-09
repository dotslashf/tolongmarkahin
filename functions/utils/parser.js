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
  if (!direct_message_events) {
    return;
  }

  const twitter = new Twitter();
  const message = twitter.getLastMessage(direct_message_events);

  try {
    const { length, tweets, userId, folderName, text } =
      getBookmarkObject(message);
    const command = getCommand(text);

    if (['/createFolder', '/buatFolder', '/+folder'].includes(command)) {
      await firestore.createFolder(userId, folderName);
      await twitter.sendDirectMessage(
        userId,
        `Folder ${folderName} telah ditambahkan`
      );
      return;
    }

    if (['/ke', '/keFolder'].includes(command)) {
      const isFolderExist = await firestore.isFolderExist(userId, folderName);
      if (!isFolderExist) {
        await firestore.createFolder(userId, folderName);
        await twitter.sendDirectMessage(
          userId,
          `Folder ${folderName} telah ditambahkan`
        );
      }

      tweets.forEach(async tweet => {
        const t = await twitter.checkTweetBookmark(tweet.tweetId);
        await firestore.addBookmark(userId, folderName, t);
      });
      await twitter.sendDirectMessage(
        userId,
        `${length} bookmark telah ditambahkan ke ${folderName}`
      );
      return;
    }

    tweets.forEach(async tweet => {
      const t = await twitter.checkTweetBookmark(tweet.tweetId);
      await firestore.addBookmark(userId, folderName, t);
      await twitter.sendDirectMessage(
        userId,
        `${length} bookmark telah ditambahkan ke ${folderName}`
      );
      return;
    });
  } catch (e) {
    logger.error(e);
  }

  // await firestore.getData();

  // await twitter.sendDirectMessage(
  //   direct_message_events,
  //   `Anjim luh banh mau bikin memekfess ya`
  // );
}

module.exports = {
  onEvent,
};
