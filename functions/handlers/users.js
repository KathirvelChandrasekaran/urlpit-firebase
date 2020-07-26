const { db } = require("../utils/admin");
const config = require("../utils/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const {
  validateSignup,
  validateSignin,
} = require("../utils/userDetailsValidators");

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
        verified: false,
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

exports.signin = (req, res) => {
  const userDetails = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateSignin(userDetails);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(userDetails.email, userDetails.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      if (err.code === "auth/wrong-password")
        return res.status(400).json({
          emailError: "Wrong password",
        });
      if (err.code === "auth/network-request-failed")
        return res.status(400).json({
          emailError: "Network error",
        });
      else
        return res.status(400).json({
          errors: err.code,
        });
    });
};

exports.verifySignin = (req, res) => {
  var user = firebase.auth().currentUser;
  user
    .sendEmailVerification()
    .then(() => {
      return res
        .status(200)
        .json({ message: "Verification mail has been sent" });
    })
    .catch((err) => {
      return res.status(400).json({
        errors: err.code,
      });
    });
};

exports.resetPassword = (req, res) => {
  var auth = firebase.auth();
  var email = req.body.email;

  auth
    .sendPasswordResetEmail(email)
    .then(() => {
      return res
        .status(200)
        .json({ message: "Reset link has been sent to the email" });
    })
    .catch((err) => {
      return res.status(400).json({
        errors: err.code,
      });
    });
};

exports.siginInWithGoogle = (req, res) => {
  var provider = new firebase.auth.GoogleAuthProvider;
  let token, userId, userName, email, createdAt;
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((res) => {
      token = res.credential.accessToken;
      var userCredentials = {
        userName: res.user.displayName,
        email: res.user.email,
        createdAt: new Date().toISOString(),
        userId: res.user.getIdToken,
        verified: res.user.emailVerified,
      };
      return db
        .doc(`/users/${userName}`)
        .set(userCredentials)
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
    });
};
