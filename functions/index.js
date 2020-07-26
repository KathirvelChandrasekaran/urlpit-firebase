const functions = require("firebase-functions");

const express = require("express");
const app = express();
// const cors = require("cors");

const { signup, signin } = require("./handlers/users");

//User signUp and login
app.post("/signup", signup);
app.post("/signin", signin);

exports.api = functions.https.onRequest(app);
