'use strict';

module.exports = function(req, res, next) {
  if (!req.user.isAdmin) {
    res.status(403).end();
  }
  else {
    next();
  }
};
