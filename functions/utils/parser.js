const Twitter = require('../service/twitter');
const { logger } = require('firebase-functions');

async function onEvent(body) {
  const { direct_message_events } = body;
  if (!direct_message_events) {
    console.log('No direct_message_events');
    return;
  }

  const twitter = new Twitter();
  const message = twitter.getLastMessage(direct_message_events);
  const { length, urls } = getBookmarkUrls(message);
  logger.log(length, urls);

  // await twitter.sendDirectMessage(
  //   direct_message_events,
  //   `Anjim luh banh mau bikin memekfess ya`
  // );
}

function getBookmarkUrls(message) {
  const urls = message.message_create.message_data.entities.urls;
  return {
    length: urls.length,
    urls: urls.map(url => url.expanded_url),
  };
}

module.exports = {
  onEvent,
};
