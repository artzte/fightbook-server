var async = require('async'),
  conf = require('../../config/convict-config'),
  _ = require('underscore');

if(conf.get('env') !== 'test') {
  throw('Destructive script; do not run this outside of test environment');
}

module.exports = {
  init: function(keystone, done) {
    keystone.init(conf.keystoneConfig());
    keystone['import']('../../models');

    keystone.mongoose.connect(conf.get('dbPath'));
    keystone.mongoose.connection.on('open', function(err) {
      if(err) {
        return done(err);
      }
      keystone.mongoose.connection.db.dropDatabase(done);
    });
  },
  initFixtures: function(keystone, done) {
    var fixtures = {};

    async.series([
      // user
      function(cb) {
        var User = keystone.list('User').model;
        var user = new User({
          name: {
            first: 'Joe',
            last: 'Smith'
          },
          email: 'joe@joe.com',
          password: 'joe',
          isAdmin: true
        });
        user.save(function(err, result) {
          fixtures.user = result;
          cb(err, result);
        });
      },
      // treatise with user as author
      function(cb) {
        var Treatise = keystone.list('Treatise').model;
        var treatise = new Treatise({
          title: 'Treatise',
          key: 'treatise',
          copyright: 'Copyright(c) 2015',
          author: fixtures.user
        });
        treatise.save(function(err, result) {
          fixtures.treatise = result;
          cb(err, result);
        });
      },
      // two pages in treatise
      function(cb) {
        var Page = keystone.list('Page').model;
        async.map([1,2], function(i, cb) {
          var page = new Page({
            title: 'Page ' + i,
            treatise: fixtures.treatise,
            index: i,
            copyright: 'Copyright(c) 2015',
            author: fixtures.user
          });
          page.save(function(err, page) {
            cb(err, page);
          });
        }, function(err, pages) {
          fixtures.pages = pages;
          cb(err, pages);
        });
      },
      // two sections in each page
      function(cb) {
        var Section = keystone.list('Section').model;
        fixtures.sections = [];
        async.map(fixtures.pages, function(page, cb) {
          var sections = [];
          async.map([1,2], function(i, cb) {
            var section = new Section({
              title: page.title + ' / Section ' + i,
              page: page,
              sortOrder: i,
              index: i,
              translation: {
                md: 'Hello and welcome to section ' + i
              }
            });
            section.save(function(err, section) {
              sections.push(section);
              fixtures.sections.push(section);
              if(err) {
                return cb(err);
              }
              cb(err, section);
            });
          }, function(err, sections) {
            if(err) {
              return cb(err);
            }
            page.sections = sections;
            page.save(cb);
          });
        }, function(err) {
          cb(err, fixtures.sections);
        });
      },
      // two sequences
      function(cb) {
        var Sequence = keystone.list('Sequence').model;
        async.map([1,2], function(i, cb) {
          var sequence = new Sequence({
            treatise: fixtures.treatise,
            title: 'Sequence ' + i,
            author: fixtures.user
          });
          sequence.save(function(err, sequence) {
            if(err) {
              return cb(err);
            }
            fixtures.treatise.sequences.push(sequence);
            fixtures.treatise.save(function(err) {
              cb(err, sequence);
            });
          });

        }, function(err, sequences) {
          fixtures.sequences = sequences;
          cb(err, sequences);
        });
      },
      // A sequence item in each sequence
      function(cb) {
        var SequenceItem = keystone.list('SequenceItem').model;
        async.map([0,1], function(i, cb) {
          var page = fixtures.pages[i],
            sequence = fixtures.sequences[i],
            section = _.find(fixtures.sections, function(section) {
              return section._id.equals(page.sections[0]);
            });
          var sequenceItem = new SequenceItem({
            title: section.title,
            page: page,
            section: section,
            sequence: sequence
          });
          sequenceItem.save(function(err, sequenceItem) {
            page.sequenceItems.push(sequenceItem);
            section.sequenceItems.push(sequenceItem);
            sequence.sequenceItems.push(sequenceItem);
            async.series([
              page.save.bind(page),
              section.save.bind(section),
              sequence.save.bind(sequence)
            ], function(err) {
              cb(err, sequenceItem);
            });
          });
        }, function(err, sequenceItems) {
          fixtures.sequenceItems = sequenceItems;
          cb(err, sequenceItems);
        });
      }
    ], function(err) {
      done(err, fixtures);
    });
  },
  teardownFixtures: function(keystone, done) {
    keystone.mongoose.connection.db.dropDatabase(done);
  }
};


