const functions = require("firebase-functions");

const express = require("express");
const app = express();
// const cors = require("cors");

const {
  signup,
  signin,
  verifySignin,
  resetPassword,
  siginInWithGoogle,
} = require("./handlers/users");

//User signUp and login
app.post("/signup", signup);
app.post("/signin", signin);
app.post("/signin/verify", verifySignin);
app.post("/resetPassword", resetPassword);
app.post("/signInWithGoogle", siginInWithGoogle);
exports.api = functions.https.onRequest(app);
