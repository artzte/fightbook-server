'use strict';

module.exports = function(user) {
  var json;
  user = user || {
    name: {},
    isAnon: true
  };
  json = {
    name: user.name,
    isAdmin: user.canAccessKeystone != null,
    //content: user.content,
    isAnon: user.isAnon,
    _id: user._id
  };
  return json;
};
