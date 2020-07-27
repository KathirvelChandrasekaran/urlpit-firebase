const { db, admin } = require("../utils/admin");

const { validateUrl } = require("../utils/userDetailsValidators");

exports.saveUrlInfo = (req, res) => {
  const userUrl = {
    url: req.body.url,
  };
  const { valid, errors } = validateUrl(userUrl);
  if (!valid) return res.status(400).json(errors);

  const urlInfo = {
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
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
