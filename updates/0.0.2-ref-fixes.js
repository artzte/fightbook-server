// Migration required due to incorrect initial setup of first test treatise
// Adds cross-reference objectId lists to all parent objects

var keystone = require('keystone'),
  fixReferences = require('../lib/fix-references');

module.exports = function(done) {
  fixReferences(keystone, done);
};

