const { db } = require("../utils/admin");
const config = require("../utils/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const { validateSignup } = require("../utils/userDetailsValidators");

exports.signup = (req, res) => {
  const newUser = {
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };
  const { valid, errors } = validateSignup(newUser);
  if (!valid) return res.status(400).json(errors);

  let token, userId;
  db.doc(`/users/${newUser.userName}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({
          emailError: "Email already exists. Please login!",
        });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      console.log(userId + " " + data.user.getIdToken());
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        userName: newUser.userName,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.userName}`).set(userCredentials);
    })
    .then(() => {
      return res.status(200).json({
        token,
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({
          emailError: "Email already in use.",
        });
      }
      if (err.code === "auth/network-request-failed") {
        return res.status(400).json({
          emailError: "Netword error",
        });
      } else {
        return res.status(400).json({
          error: err.code,
        });
      }
    });
};
