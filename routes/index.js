var express = require('express');
var issues = require('../utility/issues');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  issues.fetchIssues();

  res.render('index', { title: 'Express' });
});

module.exports = router;
