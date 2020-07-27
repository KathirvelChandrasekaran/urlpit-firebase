const functions = require("firebase-functions");

const express = require("express");
const app = express();
// const cors = require("cors");

const {
  signup,
  signin,
  verifySignin,
  resetPassword,
  // siginInWithGoogle,
  uploadImage,
} = require("./handlers/users");

const fireAuth = require("./utils/fireAuth");

//User signUp and login
app.post("/signup", signup);
app.post("/signin", signin);
app.post("/signin/verify", verifySignin);
app.post("/resetPassword", resetPassword);
app.post("/user/image", fireAuth, uploadImage);
// app.post("/signInWithGoogle", siginInWithGoogle);
exports.api = functions.https.onRequest(app);
