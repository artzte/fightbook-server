'use strict';

var retrieveSequence = require('../../../lib/retrieve-sequence'),
  toJsonPayload = require('../../../lib/to-json-payload'),
  serializeUser = require('../../../lib/serialize-user');

// requires sequenceId
module.exports = function(req, res) {
  retrieveSequence(req.params.sequenceId, function(err, sequence) {
    if(err) {
      res.send(err.status, err);
    }
    else {
      res.send(200, {
        sequence: toJsonPayload(sequence, {
          references: ['sequenceItems', 'author', 'treatise']
        }),
        sequenceItems: sequence.sequenceItems,
        users: [serializeUser(sequence.author)],
        treatises: [sequence.treatise]
      });
    }
  });
};

