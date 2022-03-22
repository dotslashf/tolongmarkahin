const admin = require('firebase-admin');
const { logger } = require('firebase-functions/v1');
const serviceAccount = require('../serviceAccountKey.json');
const bcryptjs = require('bcryptjs');

class Firestore {
  constructor() {
    this.db = null;
    this.userId = null;
  }

  init() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    this.db = admin.firestore();
  }

  async isFirstTime() {
    const snapshot = await this.db.collection('config').doc(this.userId).get();
    return !snapshot.exists;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  async createFolder(folderName) {
    try {
      await this.db
        .collection('bookmarks')
        .doc(this.userId)
        .collection(folderName)
        .add({
          createdAt: new Date(),
          tweet: {
            text: 'dummy text',
          },
        });
    } catch (e) {
      logger.error(e);
    }
  }

  async isFolderExist(folderName) {
    const docRef = await this.db
      .collection('bookmarks')
      .doc(this.userId)
      .collection(folderName)
      .get();
    return !docRef.empty;
  }

  async addBookmark(folderName, bookmark) {
    bookmark.place ? delete bookmark.place : null;
    await this.db
      .collection('bookmarks')
      .doc(this.userId)
      .collection(folderName)
      .add({
        createdAt: new Date(),
        tweet: bookmark,
      });
  }

  async getFolders() {
    const snapshot = await this.db
      .collection('bookmarks')
      .doc(this.userId)
      .listCollections();
    return snapshot.map(doc => doc.id);
  }

  async getConfig() {
    const snapshot = await this.db.collection('config').doc(this.userId).get();
    return {
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt.toDate(),
    };
  }

  async createConfig(username, folderName) {
    const generatedPassword = Array(6)
      .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
      .map(x => {
        return x[Math.floor(Math.random() * x.length)];
      })
      .join('');
    const hashedPassword = bcryptjs.hashSync(generatedPassword);

    const configObj = {
      createdAt: new Date(),
      defaultFolder: folderName ? folderName : 'general',
      password: hashedPassword,
      username: username.toLowerCase(),
    };
    await this.db.collection('config').doc(this.userId).set(configObj);

    return {
      ...configObj,
      password: generatedPassword,
    };
  }

  async setConfig({ defaultFolder, password }) {
    const config = await this.getConfig();
    console.log('password', password);
    if (password) {
      const hashedPassword = bcryptjs.hashSync(password);
      password = hashedPassword;
    }
    await this.db
      .collection('config')
      .doc(this.userId)
      .update({
        defaultFolder: defaultFolder ? defaultFolder : config.defaultFolder,
        password: password ? password : config.password,
      });
  }

  async getData() {
    console.log('getData');
    const snapshot = await this.db.collection('bookmarks').get();
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  }
}

module.exports = Firestore;
