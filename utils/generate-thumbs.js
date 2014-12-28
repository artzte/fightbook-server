#!/usr/bin/env node

'use strict';

// Usage: node utils/generate_thumbs.js {treatise-key}
//
// TODO:
// - Normalize the image heights to some config standard
// - Generate multiple thumbnail sizes for each section
// - Generate page thumbnails with a consistent height and enveloping the section rectangles

var mongoose = require('mongoose'),
    async = require('async'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    _ = require('underscore'),
    objectId = mongoose.Types.ObjectId,
    gm = require('gm'),
    config = require('../config/convict-config'),
    cropImage = require('../lib/crop-image'),
    args = process.argv.slice(2);

if(args.length === 0) {
  console.log('generate_thumbnails [treatiseKey]');
  process.exit(1);
}

mongoose.connect(config.dbPath);

var db = mongoose.connection;

function optimalPageRectangle(src, pageBounds, cb) {
  gm(src).size(function(err, val) {
    var croppingRect = {};

    if(err) {
      return cb(err);
    }

    croppingRect.width = val.width;
    croppingRect.height = val.width;
    croppingRect.x = 0;
    croppingRect.y = pageBounds.y;

    if(croppingRect.y+croppingRect.height>val.height) {
      croppingRect.y = val.height - croppingRect.height;
    }
    else if(croppingRect.height > pageBounds.height) {
      croppingRect.y -= (croppingRect.height - pageBounds.height) / 2;
    }
    return cb(null, croppingRect);
  });
}

function _sizeTo(src, height, callback) {
  var dest = src.replace('-full.jpg', '-'.concat(height, '.jpg'));
  gm(src)
    .resize(null, height)
    .write(dest, callback);
}

function sizeTo(src, height, callback) {
  if(!height) {
    throw('must provide height');
  }
  if(height.length) {
    async.series(_.map(height, function(height) {
      return function(callback) {
        _sizeTo(src, height, callback);
      };
    }), callback);
  }
  else {
    _sizeTo(src, height, callback);
  }
}

function doCrop(src, dest, bounds, callback) {
  async.series([
    function(callback) {
       cropImage(src, dest, bounds, callback);
    },
    function(callback) {
      sizeTo(dest, [600, 300, 150], callback);
    }
  ], function(err) {
    callback(err);
  });
}



function getPageBounds(page) {
  var bounds = _.map(page.sections, function(section) {
      return section.physicalBounds;
    });
  var lefts = [],
      tops = [],
      rights = [],
      bottoms = [],
      result;

  bounds = _.compact(bounds);

  if(bounds.length === 0) {
    return null;
  }
  _.each(bounds, function(bound) {
      lefts.push(bound.x);
      tops.push(bound.y);
      rights.push(bound.x + bound.width);
      bottoms.push(bound.y + bound.height);
    });

  result = {
    x: _.min(lefts),
    y: _.min(tops)
  };
  result.width = _.max(rights) - result.x;
  result.height = _.max(bottoms) - result.y;
  return result;
}

db.on('error', console.error.bind(console, 'connection error:'));

// open the connection
db.once('open', function() {
  async.waterfall([
      // fetch treatise
      function(callback) {
        mongoose.connection.db.collection('treatises', function(err, collection) {
          collection.findOne({key: args[0]}, function(err, treatise) {
              if(err || !treatise) {
                callback(err||'Treatise by name of ' + args[0] + ' not found');
              }
              else {
                callback(null, treatise);
              }
            });
          });
      },
      // fetch pages
      function(treatise, callback) {
        mongoose.connection.db.collection('pages', function(err, collection) {
          collection.find({treatise: treatise._id}).toArray(function(err, pages) {
            if(err || !pages.length) {
              callback(err||'No pages found');
            }
            else {
              callback(null, treatise, pages);
            }
          });
        });
      },
      // fetch sections and bind to pages
      function(treatise, pages, callback) {
        mongoose.connection.db.collection('sections', function(err, collection) {

          var pageIds = pages.map(function(page) {return objectId(page._id);});
          collection.find({page: {$in: pageIds}}).toArray(function(err, sections) {
            if(err) {
              callback(err);
            }
            else {
              pages.forEach(function(page) {
                page.sections = _(sections).filter(function(section) {
                  return section.page.toString() === page._id.toString();
                });
              });
              callback(null, treatise, pages);
            }
          });
        });
      },
      // generate section thumbnails
      function(treatise, pages, callback) {

        // map the page objects to a set of callbacks
        async.series( pages.map(function(page) {
            var pageSource = page.srcImage = path.join(config.mediaRoot, treatise.key, 'full', page.slug + '.jpg');
            var mediaRoot = page.mediaRoot = path.join(config.mediaRoot, treatise.key);
            var pageDest = page.pageDest = path.join(mediaRoot, 'thumbs', page.slug);

            mkdirp.sync(pageDest);

            return function(callback) {
              async.series(page.sections.map(function(section) {

                  // this callback processes a single section's thumbnails
                  return function(callback) {
                    if(!section.physicalBounds) {
                      return callback(null, pages);
                    }

                    // crop thumbnail
                    doCrop(pageSource, path.join(pageDest, 'section_'+section.sortOrder+'-full.jpg'), section.physicalBounds, callback);
                  };
                }),

                // callback for single section
                callback
              );
            };
          }),
          // callback for page sections async.series()
          function(err) {
            callback(err, treatise, pages);
          }
        );
      },

      // generate page thumbnails
      function(treatise, pages, callback) {
        async.series(pages.map(function(page) {
          return function(callback) {
            // calculate page bounds  - skip page if it has no physical section boundaries
            var pageBounds = getPageBounds(page);
            if(!pageBounds) {
              return callback();
            }

            return async.waterfall([
              function(callback) {
                optimalPageRectangle(page.srcImage, pageBounds, callback);
              },
              function(rect, callback) {
                if(!rect) {
                  return;
                }
                doCrop(page.srcImage, path.join(page.pageDest, 'page-full.jpg'), rect, callback);
              }
            ], callback);
          };
        }),
        // pages callback for page thumbnail generation
        function(err, pages) {
          console.log('done with pages', err);
          callback(err, pages);
        });
      }

     ],
     // final callback for async.waterfall()
     function(err) {
      if(err) {
        console.log('async err callback', err);
        process.exit(err);
      }
      else {
        console.log('async final callback');
        process.exit(0);
      }
    });
});

