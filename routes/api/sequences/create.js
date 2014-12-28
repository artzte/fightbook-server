'use strict';

var keystone = require('keystone'),
  async = require('async');

// POST /api/sequences
// {
//   title: required
//   authorId: optional, defaults to current user
//   content: optional markdown
// }
//
// returns sequence: {
//  _id: xxx,
//  title: xxx,
//  content: {md: "xxx", html: "xxx"},
//  author: xxx,
//  slug: xxx,
//  etc
// }

exports = module.exports = function(req, res){
  if(!req.body.title) {
    res.send(400, {message: 'invalid request: title required'});
  }

  async.waterfall([
    // validate author
    //
    function(callback) {
      if(!req.params.authorId) {
        callback(null, req.user);
      }
      else {
        // Deny proxy authorship unless admin
        if(!req.user.canAccessKeystone) {
          callback({status: 403, message: 'access denied'});
        }
        else {
          keystone.list('User').model
            .findOne({_id: req.params.id})
            .exec(callback);
        }
      }
    },

    // create the sequence
    function(author, callback) {
      keystone.list('Sequence').model.create({
        title: req.body.title,
        content: {
          md: req.body.content
        },
        author: author
      }).then(
        function(result) {
          callback(null, result);
        },
        function(err) {
          callback(err);
        }
     );
    }
  ], function(err, sequence) {
    if(err) {
      res.send(err.status, err);
    }
    else {
      res.send(200, sequence);
    }
  });
};



