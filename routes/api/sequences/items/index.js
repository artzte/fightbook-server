'use strict';

var keystone = require('keystone');

// Must filter by: page, sequence, or section
exports = module.exports = function(req, res) {
  var query;

  if(!req.params.sequenceId) {
    res.status(400).send({message: 'needs qualifier of pageId, sectionId, or sequenceId'});
    return;
  }

  query = keystone.list('Sequence').model
    .find()
    .sort({
      title: 1
    });

  if(req.params.sequenceId) {
    query = query.where({sequence: req.params.sequenceId});
  }

  query
    .exec(function(err, sequences) {
      if(err) {
        res.status(err.status).send(err);
      }
      res.send({
        sequences: sequences
      });
    });
};


