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

const { saveUrlInfo, getAllUrl, deleteUrl } = require("./handlers/urlHandler");

const fireAuth = require("./utils/fireAuth");

//User signUp and login
app.post("/signup", signup);
app.post("/signin", signin);
app.post("/signin/verify", verifySignin);
app.post("/resetPassword", resetPassword);
app.post("/user/image", fireAuth, uploadImage);
// app.post("/signInWithGoogle", siginInWithGoogle);

//URL Extract
app.post("/user/saveURL", fireAuth, saveUrlInfo);
app.get("/user/:userId/:urlId", fireAuth, getAllUrl);
app.delete("/user/:userId/:urlId", fireAuth, deleteUrl);

exports.api = functions.https.onRequest(app);
