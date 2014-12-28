'use strict';

var keystone = require('keystone'),
  Section = keystone.list('Section');

// TODO use $set, whitelist the allowable update entries

module.exports = function(req, res) {
  Section.model.findOneAndUpdate({
    _id: req.params.id
  }, req.body.section, null, function(err, section) {
    res.send({
      section: section
    });
  });
};
