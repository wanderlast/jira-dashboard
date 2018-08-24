var express = require('express');
var fs = require('fs');
var router = express.Router();

router.get('/', function(req, res) {
  console.log("Getting JSON file");

  fs.readFile("issues.json", "utf-8", function(err, issues) {
    if (err) {
      console.log("Error loading local JSON file");
    }
    else {
      res.render('index', {
        issues: issues,
        title: 'JIRA Dashboard'
      });
    }
  })
});

module.exports = router;
