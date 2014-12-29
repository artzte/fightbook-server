'use strict';

var _ = require('lodash');

var GLOBAL_EXCLUDES = ['__v', 'password'],
  GLOBAL_INCLUDES = ['_id'];

module.exports = function(schema, options) {
  var attributes, exclusions;
  options = options || {};
  attributes = options.attributes;
  exclusions = options.exclusions||[];
  exclusions = exclusions.concat(GLOBAL_EXCLUDES);
  schema.set('toJSON', {
    transform: function(/* doc, ret, options */) {
      var ret = arguments[1],
        result;

      // pick included attributes
      if(attributes) {
        result = _.pick(ret, attributes.concat(GLOBAL_INCLUDES));
      }
      else {
        result = ret;
      }
      // omit excluded attributes
      result = _.omit(result, exclusions);
      return result;
    }
  });
};

