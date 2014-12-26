var keystone = require('keystone'),
  Types = keystone.Field.Types,
  async = require('async'),
  referenceDocument = require('../lib/reference-document'),
  dereferenceDocument = require('../lib/dereference-document'),
  Sequence;

Sequence = new keystone.List('Sequence', {
  autokey: {
    path: 'slug',
    from: 'title'
  },
  map: {
    name: 'title'
  },
  defaultColumns: 'title, treatise, state|20%, author, publishedAt|15%',
  defaultSort: '-createdAt'
});

Sequence.add({
  title: {
    type: String,
    required: true
  },
  state: {
    type: Types.Select,
    options: 'draft, published, archived',
    'default': 'draft'
  },
  author: {
    type: Types.Relationship,
    ref: 'User'
  },
  treatise: {
    type: Types.Relationship,
    ref: 'Treatise'
  },
  sequenceItems: {
    type: Types.Relationship,
    ref: 'SequenceItem',
    many: true
  },
  createdAt: {
    type: Date,
    'default': Date.now
  },
  publishedAt: Date,
  content: {
    type: Types.Markdown,
    height: 300
  }
});

// Adds an item to the sequence
// Arguments:
//  sectionId: which section to reference
//    options: optional options hash
//      content: 'markdown'
//      title: 'title string'
//  cb: function(err, sequenceItem)
//
Sequence.schema.methods.addItem = function(sectionId, options, cb) {
  var sequence = this;

  if(typeof(options) === 'function') {
    cb = options;
    options = {};
  }
  else {
    options = options || {};
  }

  async.waterfall([

    // find a duplicate
    //
    function(callback) {

      keystone.list('SequenceItem').model
        .findOne({sequence: sequence._id, section: sectionId})
        .exec(function(err, response) {
          if(err) {
            callback(err);
          }
          if(response) {
            err = new Error('sequence item already exists');
            err.reason = 'duplicate';
            callback(err);
          }
          else {
            callback(null, {});
          }
        });
    },

    // get the section and with it the page
    //
    function(result, callback) {
      keystone.list('Section').model
        .findById(sectionId)
        .populate('page')
        .exec(function(err, section) {
          if(err) {
            callback(err);
          }
          else {
            result.section = section;
            callback(err, result);
          }
        });
    },

    // create the sequence item
    //
    function(result, cb) {
      var SequenceItem = keystone.list('SequenceItem').model,
        sequenceItem = new SequenceItem({
          title: options.title || result.section.page.title.concat(' : ', result.section.sortOrder),
          content: {
              md: options.content
            },
          sequence: sequence,
          section: result.section,
          page: result.section.page
        });

        sequenceItem.save(function(err) {
          cb(err, sequenceItem);
        });
    },

    // reference document in page, section, sequence
    //
    function(sequenceItem, cb) {
      referenceDocument(sequenceItem, ['Page', 'Section', 'Sequence'], 'sequenceItems', function(err) {
        cb(err, sequenceItem);
      });
    }

  ], function(err, sequenceItem) {
    //console.log('finished with', err, sequenceItem);
    cb(err, sequenceItem);
  });
};

// Removes an item from the sequence
// Arguments:
//  sectionId: which section to de-reference
//  cb: function(err, sequenceItem)
//
Sequence.schema.methods.removeItem = function(sectionId, cb) {
  var sequence = this,
    SequenceItem = keystone.list('SequenceItem').model;

  async.waterfall([

    // find the match
    //
    function(cb) {

      SequenceItem
        .findOne({section: sectionId, sequence: sequence._id})
        .exec(function(err, sequenceItem) {
          if(err) {
            return cb(err);
          }
          if(!sequenceItem) {
            err = new Error('sequence item not found');
            err.reason = 'notfound';
            return cb(err);
          }
          cb(null, sequenceItem);
        });
    },

    // remove the sequence item
    //
    function(sequenceItem, cb) {
      SequenceItem
        .findOneAndRemove({_id: sequenceItem._id}, function(err) {
          cb(err, sequenceItem);
        });
    },

    // reference document in page, section, sequence
    //
    function(sequenceItem, cb) {
      dereferenceDocument(sequenceItem, ['Page', 'Section', 'Sequence'], 'sequenceItems', function(err) {
        cb(err, sequenceItem);
      });
    }

  ], function(err, sequenceItem) {
    cb(err, sequenceItem);
  });
};

Sequence.register();

