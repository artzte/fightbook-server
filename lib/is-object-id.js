'use strict';

var objectId = require('mongoose').Types.ObjectId;

module.exports = function(id) {
  var e;
  try {
    return objectId(id);
  } catch (_error) {
    e = _error;
    return null;
  }
};
