'use strict';

var keystone = require('keystone');

module.exports = function(sequenceId, cb) {
  keystone.list('Sequence').model
    .findById(sequenceId)
    .populate(['sequenceItems', 'author', 'treatise'])
    .exec(function(err, sequence) {
      console.log(sequence);
      if(!sequence) {
        err = {
          message: ['Sequence', sequenceId, 'not found.'].join(' '),
          status: 404
        }
      }
      if(err) {
        cb(err);
      }
      else {
        cb(null, sequence);
      }
    });
};
