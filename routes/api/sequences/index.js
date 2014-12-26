var keystone = require('keystone');

// Must filter by: page, sequence, or section
exports = module.exports = function(req, res) {
  var sequenceQuery,
      sectionIds;

  function resolveSequences(err, sequences) {
    if(err) {
      res.send(err.status, err);
    }
    else {
      res.send({sequences: sequences});
      return;
    }
  }

  if(!(req.query.authorId || req.query.sectionId || req.query.treatiseId)) {
    res.send(400, {message: 'needs qualifier of authorId, sectionId, or treatiseId'});
  }

  // build basic query
  sequenceQuery = keystone.list('Sequence').model
    .find()
    .sort({
      title: 1
    });

  // simple author filter
  if(req.query.authorId) {
    return sequenceQuery
      .where({author: req.query.authorId})
      .exec(resolveSequences);
  }

  // filter by treatise
  if(req.query.treatiseId) {
    return sequenceQuery
      .where({treatise: req.query.treatiseId})
      .exec(resolveSequences);
  }

  // filter by sectionIds
  if(req.query.sectionId) {
    sectionIds = req.query.sectionId.split(',');

    return sequenceQuery
      .where({section: sectionIds})
      .exec(resolveSequences);
  }
};

