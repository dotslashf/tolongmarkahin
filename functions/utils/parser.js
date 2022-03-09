const { logger } = require('firebase-functions');
const { getBookmarkObject, getCommand } = require('./common');
const Twitter = require('../service/twitter');

async function onEvent(firestore, body) {
  const { direct_message_events } = body;
  if (!direct_message_events) {
    return;
  }

  const twitter = new Twitter();
  const message = twitter.getLastMessage(direct_message_events);
  const command = getCommand(message);

  try {
    if (command === '/addFolder' || command === '/tambahFolder') {
      console.log('bikin folder');
      await firestore.createFolder(message);
    }

    const { length, tweets } = getBookmarkObject(message);
    tweets.forEach(async tweet => {
      const t = await twitter.checkTweetBookmark(tweet.tweetId);
      await firestore.addBookmark(message, 'anjay', t);
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
