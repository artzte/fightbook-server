'use strict';

var keystone = require('keystone'),
  toJsonPayload = require('../../lib/to-json-payload'),
  serializeUser = require('../../lib/serialize-user');

module.exports = function(req, res) {
  keystone.list('Treatise').model
    .findById(req.params.id)
    .populate(['pages', 'sequences', 'author'])
    .exec(function(err, treatise) {
      if(!treatise) {
        err = {
          status: 404,
          message: 'treatise ' + req.params.id + ' not found'
        };
      }
      if (err) {
        res.status(err.status)
          .send({
            error: err.message
          });
      }
      else {
        res.send({
          treatise: toJsonPayload(treatise, {references: ['pages', 'sequences', 'author']}),
          pages: treatise.pages,
          sequences: treatise.sequences,
          users: [serializeUser(treatise.author)]
        });
      }
    });
};
