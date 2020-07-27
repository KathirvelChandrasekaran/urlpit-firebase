const admin = require("firebase-admin");
const serviceAccount = require("./urlpit-1929121e7143.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://urlpit.firebaseio.com",
  storageBucket: "urlpit.appspot.com",
});

const db = admin.firestore();
module.exports = { admin, db };
