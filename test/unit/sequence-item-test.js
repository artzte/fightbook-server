var keystone = require('keystone'),
  _ = require('underscore'),
  async = require('async'),
  should = require('should'),
  keystoneHelpers = require('../helpers/keystone-helpers');

describe('SequenceItem', function() {
  var SequenceItem;

  before(function(done) {
    keystoneHelpers.init(keystone, function(err) {
      SequenceItem = keystone.list('SequenceItem').model;
      done(err);
    });
  });

  describe('with fixtures', function() {
    var fixtures, sequence;

    beforeEach(function(done) {
      keystoneHelpers.initFixtures(keystone, function(err, results) {
        fixtures = results;
        sequence = fixtures.sequences[0];
        done();
      });
    });

    it('passes basic fixture checks', function(done) {
      var sequenceItem = _.find(fixtures.sequenceItems, function(item) {
        return item._id.equals(sequence.sequenceItems[0]);
      });
      sequence.sequenceItems.length.should.eql(1);
      sequenceItem.page.equals(fixtures.pages[0]._id).should.equal(true);
      sequenceItem.section.equals(fixtures.pages[0].sections[0]).should.equal(true);
      sequenceItem.sequence.equals(sequence._id).should.equal(true);
      fixtures.pages[0].sequenceItems.length.should.equal(1);
      done();
    });

    describe('remove', function() {
      it('does not remove an unknown section', function(done) {
        sequence.removeItem(fixtures.pages[0].sections[1], function(err, sequenceItem) {
          should.not.exist(sequenceItem);
          should.exist(err);
          err.reason.should.equal('notfound');
          sequence.sequenceItems.length.should.eql(1);
          done();
        });
      });

      it('removes an attached section', function(done) {
        sequence.removeItem(fixtures.pages[0].sections[0], function(err, sequenceItem) {
          should.exist(sequenceItem);
          should.not.exist(err);

          // Test state of associated objects
          async.parallel([
            function(cb) {
              keystone.list('SequenceItem').model.findOne({_id: sequenceItem._id}, cb);
            },
            function(cb) {
              keystone.list('Page').model.findOne({_id: sequenceItem.page}, cb);
            },
            function(cb) {
              keystone.list('Section').model.findOne({_id: sequenceItem.section}, cb);
            },
            function(cb) {
              keystone.list('Sequence').model.findOne({_id: sequenceItem.sequence}, cb);
            }
          ], function(err, results) {
            var sequenceItem, page, section, sequence;
            if(err) done(err);
            sequenceItem = results.shift();
            page = results.shift();
            section = results.shift();
            sequence = results.shift();

            should.not.exist(sequenceItem, 'record is deleted');
            page.sequenceItems.length.should.eql(0, 'page ref count');
            sequence.sequenceItems.length.should.eql(0, 'sequence ref count');
            section.sequenceItems.length.should.eql(0, 'section ref count');
            done();
          });
        });
      });
    });

    describe('create', function() {
      it('does not add a duplicate section', function(done) {
        sequence.addItem(fixtures.pages[0].sections[0], function(err, sequenceItem) {
          should.not.exist(sequenceItem);
          should.exist(err);
          err.should.not.equal(undefined);
          err.reason.should.equal('duplicate');
          sequence.sequenceItems.length.should.eql(1);
          done();
        });
      });

      it('adds a section', function(done) {
        sequence.addItem(fixtures.pages[0].sections[1], function(err, sequenceItem) {
          should.exist(sequenceItem);
          should.not.exist(err);

          sequenceItem.page.equals(fixtures.pages[0]._id).should.equal(true);
          sequenceItem.section.equals(fixtures.pages[0].sections[1]).should.equal(true);
          sequenceItem.sequence.equals(sequence._id).should.equal(true);

          // Test state of associated objects
          async.parallel([
            function(cb){
              keystone.list('Page').model.findOne({_id: sequenceItem.page}, cb);
            },
            function(cb) {
              keystone.list('Section').model.findOne({_id: sequenceItem.section}, cb);
            },
            function(cb) {
              keystone.list('Sequence').model.findOne({_id: sequenceItem.sequence}, cb);
            }
          ], function(err, results) {
            var page, section, sequence;
            if(err) done(err);

            page = results.shift();
            section = results.shift();
            sequence = results.shift();

            page.sequenceItems.length.should.eql(2, 'page ref count');
            sequence.sequenceItems.length.should.eql(2, 'sequence ref count');
            section.sequenceItems.length.should.eql(1, 'section ref count');
            done();
          });
        });
      });
    });

    afterEach(function(done) {
      keystoneHelpers.teardownFixtures(keystone, done);
    });
  });

});

