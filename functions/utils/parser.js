const Twitter = require('../service/twitter');
const Firestore = require('../service/firestore');
const { logger } = require('firebase-functions');
const { getBookmarkUrls, getCommand } = require('./common');

async function onEvent(body) {
  const { direct_message_events } = body;
  if (!direct_message_events) {
    return;
  }

  const twitter = new Twitter();
  const message = twitter.getLastMessage(direct_message_events);
  const command = getCommand(message);
  if (command === '/addFolder' || command === '/tambahFolder') {
    console.log('bikin folder');
  }
  // const { length, urls } = getBookmarkUrls(message);
  // logger.log(length, urls);

  // const firestore = new Firestore();
  // await firestore.getData();

  // await twitter.sendDirectMessage(
  //   direct_message_events,
  //   `Anjim luh banh mau bikin memekfess ya`
  // );
}

module.exports = {
  onEvent,
};
