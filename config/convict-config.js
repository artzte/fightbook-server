'use strict';

var convict = require('convict');

// define a schema
//
//

var conf = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    'default': 'development',
    env: 'NODE_ENV'
  },
  dbPath: {
    doc: 'Mongo DB path',
    format: String,
    'default': 'mongodb://localhost/fiore',
    env: 'FIGHTBOOK_DB_PATH'
  },
  mediaRoot: {
    doc: 'Path to local media files',
    format: String,
    'default': '/data/incrossada/media'
  },
  ip: {
    doc: 'The IP address to bind.',
    format: 'ipaddress',
    'default': '127.0.0.1',
    env: 'IP_ADDRESS'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    'default': 3400,
    env: 'FIGHTBOOK_PORT'
  },
  secret: {
    doc: 'Session secret',
    format: '*',
    'default': 'I have always told my students who had to fight in the lists that doing so is far less dangerous than combat with sharp swords in an arming coat',
    env: 'FIGHTBOOK_SECRET'
  },
  aws: {
    doc: 'AWS S3 keys',
    format: Object,
    'default': {
      'accessKeyId': 'key',
      'secretAccessKey': 'secret',
      'bucket': 'bucket-path',
      'region': 'aws-region'
    }
  },
  sessionStore: {
    doc: 'Session store block',
    format: Object,
    'default': {
      'host': 'localhost', // Redis server hostname
      'port': '6379',      // Redis server port
      'ttl': '60*60*24',   // Redis session TTL in seconds
      'db': '0',           // Database index to use
      'pass': '',          // Password for Redis authentication
      'prefix': 'sess:',   // Key prefix defaulting to 'sess:'
      'url': ''            // e.g. redis://user:pass@host:port/db
    }
  }
});

// load environment dependent configuration

var env = conf.get('env');
conf.loadFile('./config/' + env + '.json');

// perform validation

conf.validate();

// load keystone
conf.keystoneConfig = function() {
  return {
    'name': 'Fightbook Server',
    'brand': 'Fightbook Server',

    'mongo': conf.get('dbPath'),

    'static': 'public',
    'favicon': 'public/favicon.ico',
    'views': 'templates/views',
    'view engine': 'jade',

    'port': conf.get('port'),

    'emails': 'templates/emails',

    'auto update': true,
    'session': true,
    //'session store': conf.get('sessionStore'),
    'auth': true,
    'user model': 'User',
    'cookie secret': conf.get('secret')
  };
};

module.exports = conf;
