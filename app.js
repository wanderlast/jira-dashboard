var basicAuth = require('express-basic-auth');
var express = require('express');
var login = require('basic-auth-client-promise').login;
var path = require('path');
var favicon = require('serve-favicon');

var index = require('./routes/index');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.AUTHORIZATION_URL) {
  app.use(
    basicAuth({
      authorizer: liferayAuthorization,
      authorizeAsync: true,
      challenge: 'true',
      realm: "JIRA Dashboard"
    })
  );
}

app.use('/', index);

app.use(function(req, res) {
  res.render('error', {
    errorMessage: "Not Found",
    errorStatus: "404"
  })
});

function liferayAuthorization(user, password, callback) {
  console.log("Trigger liferay authorization");
  login(process.env.AUTHORIZATION_URL, user, password)
    .then(function() {
      callback(null, true);
    })
    .catch(function() {
      callback(null, false);
    })
}

module.exports = app;
