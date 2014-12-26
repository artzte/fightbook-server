var keystone = require('keystone'),
  async = require('async'),
  _ = require('underscore');

// object is the object that has been deleted
// referrers is the list of names of referencing objects
// refName is the key of the referring list
module.exports = function(object, referrers, refName, callback) {

  var queue = _.map(referrers, function(referer) {
    return function(cb) {
      var update = {};
      var attr = referer.toLowerCase();

      update[refName] = object._id;
      keystone.list(referer).model
        .update({_id: object[attr]},
          {$pull: update}, cb);
    };
  });

  async.series(queue, callback);
}

