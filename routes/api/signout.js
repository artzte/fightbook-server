'use strict';

module.exports = function(req, res) {
  res.clearCookie('keystone.uid');
  req.user = null;
  req.session.regenerate(function() {
    res.status(200).end();
  });
};
