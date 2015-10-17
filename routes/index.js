var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Cryptoticker Lives... on Heroku!' });
  // res.json(200, {message: "holy cow this works yeah buddy"});
});

module.exports = router;
