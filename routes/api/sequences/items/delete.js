'use strict';

var keystone = require('keystone'),
  async = require('async');

// DELETE /api/sequences/:sequenceId/items/:sectionId

exports = module.exports = function(req, res){
  async.waterfall([

    // retrieve
    function(callback) {
      keystone.list('Sequence').model
        .findOne({_id: req.params.sequenceId})
        .exec(function(err, sequence) {
          if(err) {
            return callback(err);
          }
          if(!sequence) {
            return callback(new Error({message: 'Sequence not found', reason: 'notfound'}));
          }
          callback(null, sequence);
        });
    },

    // add sequence item
    //
    function(sequence, callback) {
      sequence.removeItem(req.params.sectionId, callback);
    }

  ], function(err) {
    if(err) {
      res.status(err.reason === 'notfound' ? 404 : 400).send(err.message);
    }
    else {
      res.status(200).end();
    }
  });
};



