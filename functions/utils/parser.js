const { logger } = require('firebase-functions');
const {
  getBookmarkObject,
  getCommand,
  returnCommandsInfo,
} = require('./common');
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
    const command = getCommand(text);

    // reject non command
    if (command === null && length === 0) {
      return;
    }

    // buat folder baru
    if (['/createFolder', '/buatFolder', '/+folder'].includes(command)) {
      const isFolderExist = await firestore.isFolderExist(userId, folderName);
      if (isFolderExist) {
        return twitter.sendDirectMessage(
          userId,
          `Folder ${folderName} sudah ada, silahkan gunakan nama lain`
        );
      }
      await firestore.createFolder(userId, folderName);
      await twitter.sendDirectMessage(
        userId,
        `Folder ${folderName} telah ditambahkan`
      );
      return;
    }

    // add bookmark ke folder
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

    // list commands
    if (['/listCommands'].includes(command)) {
      await twitter.sendDirectMessage(
        userId,
        `List command:\n\n${returnCommandsInfo()}`
      );
      return;
    }

    // add bookmark ke folder default
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
    logger.error('onEvent', e);
    await twitter.sendDirectMessage(
      userId,
      'Ada yang salah pada commands, coba ketik untuk mengecek /listCommands'
    );
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
