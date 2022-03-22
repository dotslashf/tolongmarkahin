const { logger } = require('firebase-functions');
const {
  getBookmarkObject,
  getCommand,
  getSetConfigCommand,
  formatJson,
  createCommandHash,
  formatListFolder,
} = require('./common');
const Twitter = require('../services/twitter');
const Firebase = require('../services/firebase');

/**
 *
 * @param {Firebase} firebase | Firebase object class
 * @param {*} body
 * @returns
 */
async function onEvent(firebase, body) {
  const { direct_message_events, follow_events } = body;
  if (!follow_events && !direct_message_events) {
    return;
  }
  const twitter = new Twitter();

  // if (follow_events && follow_events[0].type === 'unfollow') {
  //   return;
  // }

  // if (follow_events && follow_events[0].type === 'follow') {
  //   const userId = follow_events[0].source.id;
  //   twitter.setRecipientId(userId);
  //   await twitter.sendDirectMessage({ type: 'follow' });
  //   return;
  // }

  const message = twitter.getLastMessage(direct_message_events);

  let { length, tweets, userId, folderName, text } = getBookmarkObject(message);

  try {
    firebase.setUserId(userId);
    const isFirstTime = await firebase.isFirstTime();
    if (isFirstTime) {
      const user = await twitter.getUserProfile(userId);
      const defaultConfig = await firebase.createConfig(
        user.screen_name,
        folderName
      );
      await twitter.sendDirectMessage({
        type: 'firstTime',
        text: user.screen_name,
      });
      await twitter.sendDirectMessage({
        type: 'config',
        text: formatJson(defaultConfig),
      });
    }
    const config = await firebase.getConfig();
    folderName = folderName || config.defaultFolder;
    const command = getCommand(text);

    // reject non command
    if (command === null && length === 0) {
      return;
    }

    const commandHash = createCommandHash();

    // buat folder baru
    if (
      commandHash['/buatFolder']
        .concat('/buatFolder')
        .map(c => c.toLowerCase())
        .includes(command)
    ) {
      const isFolderExist = await firebase.isFolderExist(folderName);
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
      await firebase.createFolder(folderName);
      await twitter.sendDirectMessage({
        type: 'tambahFolder',
        folderName,
      });
      return;
    }

    // add bookmark ke folder
    if (
      commandHash['/ke']
        .concat('/ke')
        .map(c => c.toLowerCase())
        .includes(command)
    ) {
      const isFolderExist = await firebase.isFolderExist(folderName);
      if (!isFolderExist) {
        await firebase.createFolder(folderName);
        await twitter.sendDirectMessage({
          type: 'tambahFolder',
          folderName,
        });
      }

      await Promise.all(
        tweets.map(async tweet => {
          const t = await twitter.checkTweetBookmark(tweet.tweetId);
          await firebase.addBookmark(folderName, t);
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

    if (
      commandHash['/listFolder']
        .concat('/listFolder')
        .map(c => c.toLowerCase())
        .includes(command)
    ) {
      const folders = await firebase.getFolders();
      const foldersText = formatListFolder(folders, config.defaultFolder);
      await twitter.sendDirectMessage({
        type: 'listFolder',
        text: foldersText,
      });
    }

    if (
      commandHash['/getConfig']
        .concat('/getConfig')
        .map(c => c.toLowerCase())
        .includes(command)
    ) {
      await twitter.sendDirectMessage({
        type: 'config',
        text: formatJson(config),
      });
    }

    if (
      commandHash['/setConfig']
        .concat('/setConfig')
        .map(c => c.toLowerCase())
        .includes(command)
    ) {
      const isCorrectFormat = text.split(' ').length === 3;
      if (!isCorrectFormat) {
        return twitter.sendDirectMessage({
          type: 'error',
          text: 'format salah',
        });
      }
      let { command, value } = getSetConfigCommand(text);
      const update = { [command]: value };
      await firebase.setConfig(update);
      const updatedConfig = await firebase.getConfig();
      await twitter.sendDirectMessage({
        type: 'config',
        text: formatJson(updatedConfig),
      });
    }

    // add bookmark ke folder default
    if (!command && length > 0) {
      await Promise.all(
        tweets.map(async tweet => {
          const t = await twitter.checkTweetBookmark(tweet.tweetId);
          await firebase.addBookmark(folderName, t);
          return;
        })
      );
      await twitter.sendDirectMessage({
        type: 'tambahBookmark',
        folderName,
        length,
      });
    }
  } catch (e) {
    logger.error('onEvent', e);
    await twitter.sendDirectMessage({ type: 'error', text: e });
  }
}

module.exports = {
  onEvent,
};
