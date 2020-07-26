const { admin, db } = require("./admin");

module.exports = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("urlpit ")
  ) {
    idToken = req.headers.authorization.split("urlpit ")[1];
  } else {
    return res.status(403).json({
      errors: "Unauthorized. Please login!!!",
    });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "===", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.userName = data.docs[0].data().userName;
      return next();
    })
    .catch((err) => {
      return res.json(403).json(err.code);
    });
};
