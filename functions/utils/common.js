const crypto = require('crypto');
const { commands } = require('../constants/index');

function validateSignature(header, body) {
  const signatureHeaderName = 'x-twitter-webhooks-signature';

  if (typeof header[signatureHeaderName] === 'undefined') {
    throw new TypeError(
      `validateSignature: header ${signatureHeaderName} not found`
    );
  }

  const signature =
    'sha256=' +
    crypto
      .createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET)
      .update(body.toString())
      .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(header[signatureHeaderName]),
    Buffer.from(signature)
  );
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function fixCharFolderName(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function getBookmarkObject(message) {
  const urls = message.message_create.message_data.entities.urls;
  let userId = message.message_create.sender_id;
  userId === '1412415440559689735'
    ? (userId = message.message_create.target.recipient_id)
    : userId;
  const text = message.message_create.message_data.text;
  const isUrl = isValidUrl(text.split(' ')[1]);
  const folderName = fixCharFolderName(text.split(' ')[1]);
  return {
    length: urls.length,
    userId,
    folderName: isUrl ? null : folderName,
    text,
    tweets: urls.map(url => {
      return {
        url: url.expanded_url,
        tweetId: url.expanded_url.match(/status\/(\d*)/)[1],
      };
    }),
  };
}

function getCommand(text) {
  const command = text.split(' ')[0];
  const allCommands = commands
    .map(c => {
      return [c.command, c.alias ? c.alias : null];
    })
    .flat()
    .flat()
    .filter(obj => obj);
  const resultCommand = allCommands.filter(c => {
    const re = new RegExp(`(^${c}$)`, 'm');
    return command.match(re);
  })[0];
  return resultCommand ? resultCommand.toLowerCase() : null;
}

function getSetConfigCommand(text) {
  try {
    const command = text.split(' ')[1];
    const value = text.split(' ')[2];
    return {
      command,
      value,
    };
  } catch {
    throw new Error('Set config command error');
  }
}

function getRenameFolder(text) {
  try {
    const oldName = fixCharFolderName(text.split(' ')[1]);
    const newName = fixCharFolderName(text.split(' ')[2]);
    return {
      oldName,
      newName,
    };
  } catch {
    throw new Error('Set config command error');
  }
}

function getDeleteFolder(text) {
  try {
    const folderName = fixCharFolderName(text.split(' ')[2]);
    return {
      folderName,
    };
  } catch {
    throw new Error('Set config command error');
  }
}

function formatCommandsHelp() {
  return commands
    .map(
      c =>
        `💡 ${c.command}${c.alias ? `\nalias: ${c.alias.join(', ')}` : ''}${
          c.help !== '' ? `\n❓ ${c.help}` : ''
        }\nℹ️ ${c.description}`
    )
    .join('\n\n');
}

function formatJson(json) {
  let result = [];
  for (let key in json) {
    if (key !== 'createdAt') {
      result.push(`🏷️ ${key} = ${json[key]}`);
    }
  }
  return result.sort().join('\n\n');
}

function createCommandHash() {
  const commandHash = {};

  commands.map(command => {
    if (command.alias) {
      commandHash[command.command] = command.alias;
    }
  });

  return commandHash;
}

function formatListFolder(folders, folderName) {
  const index = folders.findIndex(folder => {
    return folder === folderName;
  });
  folders.map((f, i) => {
    if (i === index) {
      folders[i] = `✨  ${f}`;
    } else {
      folders[i] = `〰️ ${f}`;
    }
  });
  return folders.join('\n');
}

function formatFolderName(folderName) {
  const re = new RegExp(
    /(\w|\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g
  );

  let _folderName = folderName;
  const result = _folderName.match(re);
  result.filter(r => {
    _folderName = _folderName.replace(r, '');
  });
  const forbiddenChars = _folderName.split('');
  const finalFolderName = result.join('');
  return {
    formattedFolderName: finalFolderName,
    forbiddenChars,
  };
}

module.exports = {
  validateSignature,
  getBookmarkObject,
  getCommand,
  formatCommandsHelp,
  formatJson,
  getSetConfigCommand,
  createCommandHash,
  formatListFolder,
  getRenameFolder,
  formatFolderName,
  getDeleteFolder,
};
