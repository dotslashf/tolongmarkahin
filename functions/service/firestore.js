const admin = require('firebase-admin');
const { logger } = require('firebase-functions/v1');
const serviceAccount = require('../../serviceAccountKey.json');

class Firestore {
  constructor() {
    this.db = null;
  }

  init() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    this.db = admin.firestore();
  }

  async createFolder(userId, folderName) {
    try {
      await this.db
        .collection('bookmarks')
        .doc(userId)
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

  async isFolderExist(userId, folderName) {
    const docRef = await this.db
      .collection('bookmarks')
      .doc(userId)
      .collection(folderName)
      .get();
    return !docRef.empty;
  }

  async addBookmark(userId, folderName, bookmark) {
    if (!folderName) {
      folderName = 'general';
    }
    await this.db
      .collection('bookmarks')
      .doc(userId)
      .collection(folderName)
      .add({
        createdAt: new Date(),
        tweet: bookmark,
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
