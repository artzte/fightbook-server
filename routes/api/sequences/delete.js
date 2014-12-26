var keystone = require('keystone'),
  async = require('async');

// DELETE /api/sequences/:sequenceId

module.exports = function(req, res) {
  async.waterfall([
    // get sequence
    function(callback) {
      keystone.list('Sequence').model
        .findById(req.params.sequenceId)
        .exec(function(err, sequence) {
          if(!sequence) {
            err = new Error(['Sequence', req.params.sequenceId, 'not found'].join(' '));
            err.status = 404;
          }
          callback(err, sequence);
        });
    },

    // verify ownership
    function(sequence, callback) {
      var err;

      if(!(sequence.author.equals(req.user._id) || req.user.id.isAdmin)) {
        err = new Error('Insufficient permissions');
        err.status = 403;
      }
      callback(err, sequence);
    },
    // remove sequence items
    function(sequence, callback) {
      keystone.list('SequenceItem').model
        .remove({ sequence: sequence })
        .exec(function(err) {
          callback(err, sequence);
        });
    },

    // remove sequence
    function(sequence, callback) {
      sequence
        .remove(function(err) {
          callback(err, sequence);
        });
    }
  ],
  // render response
  function(err) {
    if(err) {
      err.status = err.status || 500;
      res.status(err.status).send(err);
    }
    else {
      res.status(200).end();
    }
  });
};




