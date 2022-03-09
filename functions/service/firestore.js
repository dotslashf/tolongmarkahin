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

  async createFolder(message) {
    const userId = message.message_create.sender_id;
    const folderName = message.message_create.message_data.text.split(' ')[1];
    const docRef = this.db.collection('bookmarks').doc(userId);
    const docs = await docRef.get();
    
    // await docRef.update({
    //   [folderName]: [],
    // });
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
