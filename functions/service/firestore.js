const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

class Firestore {
  constructor() {
    this.admin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    this.db = this.admin.firestore();
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
