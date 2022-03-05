function onEvent(body) {
  const { direct_message_events } = body;
  if (!direct_message_events) {
    return;
  }
  console.log(JSON.stringify(body, null, 2));
}

module.exports = {
  onEvent,
};
