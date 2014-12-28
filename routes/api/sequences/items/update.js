'use strict';

var keystone = require('keystone');

// PUT /api/sequences/:sequenceId/items/:sectionId

module.exports = function(req, res) {
  keystone.list('SequenceItem').model
    .findOneAndUpdate({
          sequence: req.params.sequenceId,
          section: req.params.sectionId
        },
        req.body.sequenceItem,
        {upsert:true},
        function(err, doc) {
          if(err) {
            res.send(err);
          }
          else {
            res.send({sequenceItem: doc});
          }
        }
     );
};

