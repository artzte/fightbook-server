module.exports = function(done) {
  var User = require('keystone').list('User'),
    model = new User.model({
      name: {
        first: 'Admin',
        last: 'User'
      },
      email: 'fiore-admin@lonin.org',
      password: 'admin',
      isAdmin: true
    });
  return model.save(done);
};

