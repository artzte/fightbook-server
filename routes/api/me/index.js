'use strict';

var serializeUser = require('../../../lib/serialize-user');

module.exports = function(req, res) {
  return res.send(200, serializeUser(req.user));
};

