const { logger } = require('firebase-functions');
const {
  getBookmarkObject,
  getCommand,
  getSetConfigCommand,
  formatJson,
  createCommandHash,
  formatListFolder,
  getRenameFolder,
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
        return await twitter.sendDirectMessage({
          type: 'error',
        });
      }
      if (isFolderExist) {
        return await twitter.sendDirectMessage({
          type: 'folderExist',
          folderName,
        });
      }
      if (folderName.includes('[') || folderName.includes(']')) {
        return await twitter.sendDirectMessage({
          type: 'error',
          text: 'nama folder tidak boleh mengandung karakter [ dan ]',
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
        await twitter.sendDirectMessage({
          type: 'error',
          text: 'format salah',
        });
        return;
      }
      let { command, value } = getSetConfigCommand(text);
      if (value.includes('[') || value.includes(']')) {
        await twitter.sendDirectMessage({
          type: 'error',
          text: 'nama folder tidak boleh mengandung karakter [ dan ]',
        });
        return;
      }
      const update = { [command]: value };
      await firebase.setConfig(update);
      const updatedConfig = await firebase.getConfig();
      await twitter.sendDirectMessage({
        type: 'config',
        text: formatJson(updatedConfig),
      });
    }

    if (
      commandHash['/renameFolder']
        .concat('/renameFolder')
        .map(c => c.toLowerCase())
        .includes(command)
    ) {
      const isCorrectFormat = text.split(' ').length === 3;
      if (!isCorrectFormat) {
        await twitter.sendDirectMessage({
          type: 'error',
          text: 'format salah',
        });
        return;
      }
      let { oldName, newName } = getRenameFolder(text);
      if (oldName === newName) {
        await twitter.sendDirectMessage({
          type: 'error',
          text: 'nama folder tidak boleh sama',
        });
        return;
      }
      if (
        oldName.includes('[') ||
        oldName.includes(']') ||
        newName.includes('[') ||
        newName.includes(']')
      ) {
        await twitter.sendDirectMessage({
          type: 'error',
          text: 'nama folder tidak boleh mengandung karakter [ dan ]',
        });
        return;
      }
      const isFolderExist = await firebase.isFolderExist(oldName);
      if (!isFolderExist) {
        await twitter.sendDirectMessage({
          type: 'folderNotExist',
          folderName: oldName,
        });
        return;
      }
      const isFolderNewExist = await firebase.isFolderExist(newName);
      if (isFolderNewExist) {
        await twitter.sendDirectMessage({
          type: 'folderExist',
          folderName: newName,
        });
        return;
      }
      const bookmarks = await firebase.getAllBookmarks(oldName);
      await firebase.moveBookmark(newName, bookmarks);
      await firebase.deleteCollection(oldName);
      await twitter.sendDirectMessage({
        type: 'renameFolder',
        folderName: oldName,
        text: newName,
      });
      const folders = await firebase.getFolders();
      const foldersText = formatListFolder(folders, config.defaultFolder);
      await twitter.sendDirectMessage({
        type: 'listFolder',
        text: foldersText,
      });
    }

    if (!command && length > 0) {
      // add bookmark ke folder default
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
    await twitter.sendDirectMessage({
      type: 'error',
      text: `${e}\n\n silahkan kirim pesan error ini ke @dotslashf / @mockdotexe`,
    });
  }
}

module.exports = {
  onEvent,
};
