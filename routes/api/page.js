'use strict';

var keystone = require('keystone'),
  toJsonPayload = require('../../lib/to-json-payload');

module.exports = function(req, res) {
  keystone.list('Page').model
    .findById(req.params.id)
    .populate(['sequenceItems', 'sections', 'treatise'])
    .exec(function(err, page) {
      if(!page) {
        err = {
          status: 404,
          message: 'page ' + req.params.id + ' not found'
        };
      }
      if(err) {
        res.status(err.status || 400)
          .send({
            message: err.message
          });
      }
      else {
        res.send({
          page: toJsonPayload(page, {references: ['sections', 'sequenceItems', 'treatise']}),
          sections: page.sections,
          sequenceItems: page.sequenceItems,
          treatise: page.treatise
        });
      }
    });
};

