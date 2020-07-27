const { db, admin } = require("../utils/admin");
const config = require("../utils/config");
const { uuid } = require("uuidv4");
const firebase = require("firebase");
firebase.initializeApp(config);

const {
  validateSignup,
  validateSignin,
} = require("../utils/userDetailsValidators");

const BusBoy = require("busboy");
const os = require("os");
const fs = require("fs");
const path = require("path");

let noImg;

exports.signup = (req, res) => {
  const newUser = {
    userName: req.body.userName,
    email: req.body.email,
    gender: req.body.gender,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };
  const { valid, errors } = validateSignup(newUser);
  if (!valid) return res.status(400).json(errors);

  if (newUser.gender === "male") {
    noImg = "male-icon.png";
  } else if (newUser.gender === "female") {
    noImg = "female-icon.png";
  } else {
    noImg = "happiness.png";
  }

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
        gender: newUser.gender,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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
  var provider = new firebase.auth.GoogleAuthProvider();
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

exports.uploadImage = (req, res) => {
  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }
    // my.image.png
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    // 645235423674523.png
    imageFileName = `${Math.round(
      Math.random() * 100000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.userName}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: "Image uploaded successfully" });
      })
      .catch((err) => {
        // console.error(err);
        if (err.code === "auth/argument-error")
          return res.status(400).json({ error: "Access denied. Please login" });
        if (err.code === "auth/network-request-failed") {
          return res.status(400).json({
            emailError: "Netword error",
          });
        } else return res.status(500).json({ error: err.code });
      });
  });
  busboy.end(req.rawBody);
};
