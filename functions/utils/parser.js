function onEvent(events) {
  console.log(JSON.stringify(events, null, 2));
}

module.exports = {
  onEvent,
};
