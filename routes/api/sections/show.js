'use strict';

var keystone = require('keystone');

module.exports = function(req, res) {
  keystone.list('Section').model
    .findById(req.params.id)
    .exec(function(err, section) {
      res.send({
        section: section
      });
    });
};
