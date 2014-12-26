'use strict';

var session = require('keystone/lib/session'),
  serializeUser = require('../../lib/serialize-user');

function signin(req, res) {
  var data;
  if (!(req.body.email && req.body.password)) {
    res.status(400).send({
      message: 'Please enter your email address and password.'
    });
    return false;
  }
  data = {
    email: req.body.email.toLowerCase(),
    password: req.body.password
  };
  session.signin(data, req, res,
    function() {
      res.send(serializeUser(req.user));
    },
    function() {
      res.status(403).send({
        message: 'Cannot find a user with that email and password'
      });
  });
}

module.exports = function(req, res) {
  var user = serializeUser(req.user);
  if (user.isAnon) {
    signin(req, res);
  }
  else {
    res.send({
      message: 'You are already signed in'
    });
  }
};

