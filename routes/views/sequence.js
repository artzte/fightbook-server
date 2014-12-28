'use strict';

var keystone = require('keystone'),
  async = require('async'),
  _ = require('lodash'),
  retrieveSequence = require('../../lib/retrieve-sequence');

module.exports = function(req, res) {

  var view = new keystone.View(req, res),
    locals = res.locals;

  async.waterfall([
    function(callback) {
      retrieveSequence(req.params.sequenceId, callback);
    },
    function(sequence, callback) {
      // attach sections to sequenceItems
      keystone.list('Section').model
        .find()
        .where({_id: {$in: _.pluck(sequence.sequenceItems, 'section')}})
        .populate(['page'])
        .exec(function(err, sections) {
          console.log('sections', err, sections);
          if(!err) {
            _.each(sequence.sequenceItems, function(sequenceItem) {
              var match = _.find(sections, function(section) {
                  return section._id.equals(sequenceItem.section);
                });
              console.log('matched', match);
              sequenceItem.section = match;
            });
          }
          callback(err, sequence);
        });
    }
  ], function(err, sequence) {
    locals.sequence = sequence;

    view.render('sequence');
  });

};

