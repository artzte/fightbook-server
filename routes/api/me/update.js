'use strict';

var keystone = require('keystone'),
  moment = require('moment'),
  User = keystone.list('User');

module.exports = function(req, res) {
  var user = req.user,
    timestamp = moment();

  user.visitsCount = user.visitsCount || 0;

  if (user.lastVisitAt && user.visitsCount && moment(user.lastVisitAt).diff(timestamp, 'days') === 0) {
    res.status(204).end();
    return;
  }
  user.visitsCount += 1;
  User.model.findOneAndUpdate({
      _id: user.id
    }, {
      visitsCount: user.visitsCount,
      lastVisitAt: timestamp.toISOString()
    }, null, function(err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(204).end();
      }
  });
};
