const { logger } = require('firebase-functions');
const { getBookmarkUrls, getCommand } = require('./common');
const Twitter = require('../service/twitter');

async function onEvent(firestore, body) {
  const { direct_message_events } = body;
  if (!direct_message_events) {
    return;
  }

  const twitter = new Twitter();
  const message = twitter.getLastMessage(direct_message_events);
  const command = getCommand(message);

  if (command === '/addFolder' || command === '/tambahFolder') {
    console.log('bikin folder');
    await firestore.createFolder(message);
  }
  // const { length, urls } = getBookmarkUrls(message);
  // logger.log(length, urls);

  // await firestore.getData();

  // await twitter.sendDirectMessage(
  //   direct_message_events,
  //   `Anjim luh banh mau bikin memekfess ya`
  // );
}

module.exports = {
  onEvent,
};
