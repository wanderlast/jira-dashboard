var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var index = require('./routes/index');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.use(function(req, res) {
  res.render('error', {
    errorMessage: "Not Found",
    errorStatus: "404"
  })
});

module.exports = app;
