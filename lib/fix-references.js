var async = require('async'),
  _ = require('underscore');

function extractIds(collection, id, attribute) {
  var result;
  result = _.filter(collection, function(item) {
      return id.equals(item[attribute]);
    });
  return _.pluck(result, '_id');
}

function doCallback(callback, err, result, models) {
  if(err) {
    console.log('Update failed', err);
  }
  callback(err, models);
}

module.exports = function fixReferences(keystone, done) {
  async.waterfall([
    // get each treatise, page, section, user, sequence, sequenceItem
    function(callback) {
      var models = ['Page', 'Section', 'Sequence', 'SequenceItem', 'Treatise', 'User'],
        resultMap = {};

      console.log('Retrieving models');
      async.mapSeries(models,
        // worker function for each iteration
        function(modelType, cb) {
          keystone.list(modelType).model
            .find().exec().then(
              function(results) {
                cb(null, results);
              },
              function(err) {
                console.log('Retrieval error', modelType, err);
                cb(err);
              }
            );
        },

        // final callback - maps results into object
        function(err, results) {
          console.log('Completed retrieval');
          _(models).each(function(modelType, i) {
            resultMap[modelType] = results[i];
          });
          callback(null, resultMap);
        }
      );
    },

    // page - sections, sectionItems
    function(models, callback) {
      console.log('Processing pages');
      async.map(models.Page,
        function(page, cb) {
          page.sections = extractIds(models.Section, page._id, 'page');
          page.sequenceItems = extractIds(models.SequenceItem, page._id, 'page');
          page.save(cb);
        },
        function(err, result) { doCallback(callback, err, result, models); }
      );
    },

    // section - sequenceItems
    function(models, callback) {
      console.log('Processing sections');
      async.map(models.Section,
        function(section, cb) {
          section.sequenceItems = extractIds(models.SequenceItem, section._id, 'section');
          section.save(cb);
        },
        function(err, result) { doCallback(callback, err, result, models); }
      );
    },

    // for each sequence - sequenceItems
    function(models, callback) {
      console.log('Processing sequenceItems');
      async.map(models.Sequence,
        function(sequence, cb) {
          sequence.sequenceItems = extractIds(models.SequenceItem, sequence._id, 'sequence');
          sequence.save(cb);
        },
        function(err, result) { doCallback(callback, err, result, models); }
      );
    },

    // for each treatise - pages, sequences
    function(models, callback) {
      console.log('Processing treatises');
       async.map(models.Treatise,
        function(treatise, cb) {
          //treatise.author = objectId('53b581256f794bb17afd05aa');
          treatise.pages = extractIds(models.Page, treatise._id, 'treatise');
          treatise.sequences = extractIds(models.Sequence, treatise._id, 'treatise');
          treatise.save(cb);
        },
        function(err, result) { doCallback(callback, err, result, models); }
      );
    },

    // for each user - treatises, sequences
    function(models, callback) {
       console.log('Processing users');
       async.map(models.User,
        function(user, cb) {
          user.treatises = extractIds(models.Treatise, user._id, 'author');
          user.sequences = extractIds(models.Sequence, user._id, 'author');
          user.save(cb);
        },
        function(err, result) { doCallback(callback, err, result, models); }
      );
    }
  ], function(err) {
    if(err) {
      console.log('Ref fix failed', err);
    }
    done(err);
  });
}

