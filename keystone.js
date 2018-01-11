/* jshint camelcase: false */

var keystone = require('keystone'),
  config = require('./config/convict-config');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init(config.keystoneConfig());


// Load your project's Models

keystone['import']('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set('locals', {
  _: require('underscore'),
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable
});

// Load your project's Routes

keystone.set('routes', require('./routes'));

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.

keystone.set('email locals', {
  logo_src: '/images/logo-email.gif',
  logo_width: 194,
  logo_height: 76,
  theme: {
    email_bg: '#f9f9f9',
    link_color: '#2697de',
    buttons: {
      color: '#fff',
      background_color: '#2697de',
      border_color: '#1a7cb7'
    }
  }
});

// Configure the navigation bar in Keystone's Admin UI

keystone.set('nav', {
  users: 'users',
  treatises: 'treatises',
  pages: 'pages',
  sections: 'sections',
  sequences: 'sequences',
  sequenceItems: 'sequence-items'
});


// Start Keystone to connect to your database and initialise the web server

keystone.start();
