const { db, admin } = require("../utils/admin");
const config = require("../utils/config");

const { validateUrl } = require("../utils/detailsValidators");
const e = require("express");

exports.saveUrlInfo = (req, res) => {
  const userUrl = {
    url: req.body.url,
  };
  const { valid, errors } = validateUrl(userUrl);
  if (!valid) return res.status(400).json(errors);

  let dummyUrl;
  if (req.body.image === "") {
    dummyUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/dummyUrl.png?alt=media`;
  } else {
    dummyUrl = req.body.image;
  }
  console.log(dummyUrl);

  const urlInfo = {
    title: req.body.title,
    description: req.body.description,
    image: dummyUrl,
    createdAt: new Date().toISOString(),
    url: req.body.url,
    uid: req.user.uid,
    tag: req.body.tag,
  };

  db.collection("urlinfo")
    .add(urlInfo)
    .then((doc) => {
      const resUrl = urlInfo;
      resUrl.urlId = doc.id;
      res.json(resUrl);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
};

exports.getAllUrl = (req, res) => {
  let urlInfoData = {};
  if (req.params.userId === req.user.uid) {
    db.doc(`/urlinfo/${req.params.urlId}`)
      .get()
      .then((doc) => {
        if (!doc.exists)
          return res.status(404).json({
            error: "No data found",
          });
        urlInfoData = doc.data();
        return res.json(urlInfoData);
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({
          error: err.code,
        });
      });
  } else {
    return res.status(403).json({
      error: "Invalid access",
    });
  }
};

exports.deleteUrl = (req, res) => {
  if (req.params.userId === req.user.uid) {
    const document = db.doc(`/urlinfo/${req.params.urlId}`);
    document
      .get()
      .then((doc) => {
        if (!doc.exists)
          return res.status(404).json({
            error: "Data not found",
          });

        document.delete();
      })
      .then(() => {
        res.json({
          message: "Data deleted successfully",
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({
          error: err.code,
        });
      });
  } else {
    return res.status(403).json({
      error: "Invalid access",
    });
  }
};

exports.searchTag = (req, res) => {
  let searchData = [];
  var searchTag = req.params.tagName;
  if (req.params.userId === req.user.uid) {
    db.collection("urlinfo")
      .where("tag", "==", `#${searchTag}`)
      .orderBy("createdAt", "desc")
      .get()
      .then((data) => {
        data.forEach((doc) => {
          searchData.push(doc.data());
        });
        if (searchData == '')
          return res.json({
            message: "No result found",
          });
        else return res.json(searchData);
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({
          error: err.code,
        });
      });
  } else {
    return res.status(403).json({
      error: "Invalid access",
    });
  }
};
