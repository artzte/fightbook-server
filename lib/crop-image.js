var path = require('path'),
    gm = require('gm'),
    config = require('../config/config');

exports = module.exports = function(src, dest, rect, callback){
  gm(src)
    .crop(rect.width, rect.height, rect.x, rect.y)
    .write(dest, function(err){
      callback(err);
    });
};

