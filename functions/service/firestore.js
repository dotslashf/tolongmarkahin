const admin = require('firebase-admin');
const { logger } = require('firebase-functions/v1');
const serviceAccount = require('../../serviceAccountKey.json');

class Firestore {
  constructor() {
    this.db = null;
    this.userId = null;
  }

  init() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    this.db = admin.firestore();
  }

  async isFirstTime() {
    const snapshot = await this.db.collection('config').doc(this.userId).get();
    return !snapshot.exists;
  }

  async setUserId(userId) {
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
      logger.info(`success createFolder: ${userId} ${folderName}`);
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
    if (!folderName) {
      folderName = 'general';
    }
    await this.db
      .collection('bookmarks')
      .doc(this.userId)
      .collection(folderName)
      .add({
        createdAt: new Date(),
        tweet: bookmark,
      });
  }

  async getConfig() {
    const snapshot = await this.db.collection('config').doc(this.userId).get();
    return snapshot.data();
  }

  async createConfig() {
    const generatedPassword = Array(6)
      .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
      .map(x => {
        return x[Math.floor(Math.random() * x.length)];
      })
      .join('');
    await this.db.collection('config').doc(this.userId).set({
      createdAt: new Date(),
      defaultFolder: 'general',
      password: generatedPassword,
    });
  }

  async setConfig({ defaultFolder, password }) {
    const config = await this.getConfig();
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
