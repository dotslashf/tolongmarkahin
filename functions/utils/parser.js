const Twitter = require('../service/twitter');

async function onEvent(body) {
  const { direct_message_events } = body;
  if (!direct_message_events) {
    console.log('No direct_message_events');
    return;
  }

  const twitter = new Twitter();

  await twitter.sendDirectMessage(
    direct_message_events,
    `Anjim luh banh mau bikin memekfess ya`
  );
}

module.exports = {
  onEvent,
};
