'use strict';

var keystone = require('keystone'),
  Treatise = keystone.list('Treatise');

module.exports = function(req, res) {
  Treatise.model
    .find()
    .exec(function(err, treatises) {
      res.status(200).send({
        treatises: treatises
      });
    });
};
