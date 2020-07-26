const functions = require("firebase-functions");

const express = require("express");
const app = express();
// const cors = require("cors");

const { signup } = require("./handlers/users");

app.post("/signup", signup);

exports.api = functions.https.onRequest(app);
