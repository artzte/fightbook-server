// Helper function for constructing an object blob
'use strict';

var _ = require('lodash');

module.exports = function toJsonPayload(result, options) {
  var json = (result.toJSON && result.toJSON()) || _.clone(result, true);

  options = options || {};

  if(options.references) {
    _.each(options.references, function(attr) {
      var ref = json[attr];
      if(_.isArray(ref)) {
        json[attr] = _.pluck(ref, '_id');
      }
      else {
        json[attr] = ref._id;
      }
    });
  }
  return json;
};
