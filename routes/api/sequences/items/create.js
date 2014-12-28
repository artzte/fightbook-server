'use strict';

var keystone = require('keystone'),
  async = require('async');

// POST /api/sequences/:sequenceId/items/:sectionId
// {
//   title: xxx # optional
//   content: xxx # optional
// }
//
// returns sequence_item: {
//  id: xxx,
//  title: xxx,
//  content: xxx,
//  sequenceId: xxx
// }

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
      sequence.addItem(req.params.sectionId, {
          title: req.body.title,
          content: {
              md: req.body.content
            }
        }, callback);
    }

  ], function(err, sequenceItem) {
    if(err) {
      res.status(err.reason === 'notfound' ? 404 : 400).send(err.message);
    }
    else {
      res.send({
        sequenceItems: [sequenceItem]
      });
    }
  });
};



