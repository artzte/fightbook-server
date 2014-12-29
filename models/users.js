'use strict';

var keystone = require('keystone'),
  addJsonTransform = require('../lib/add-json-transform'),
  Types = keystone.Field.Types,
  User;

User = new keystone.List('User', {
  defaultColumns: 'name, isAdmin, email, visitsCount, lastVisitAt',
  defaultSort: 'name'
});

User.add({
  name: {
    type: Types.Name,
    required: true,
    index: true
  },
  email: {
    type: Types.Email,
    initial: true,
    required: true,
    index: true
  },
  password: {
    type: Types.Password,
    initial: true
  },
  isAdmin: {
    type: Boolean,
    initial: false
  },
  content: {
    type: Types.Markdown,
    height: 300
  },
  lastVisitAt: {
    type: Types.Date
  },
  visitsCount: {
    type: Types.Number,
    initial: 0
  },
  activationCode: {
    type: Types.Text
  },
  resetCode: {
    type: Types.Text
  },

  sequences: {
    type: Types.Relationship,
    ref: 'Sequence',
    many: true
  },

  treatises: {
    type: Types.Relationship,
    ref: 'Treatise',
    many: true
  }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
  return this.isAdmin;
});

addJsonTransform(User.schema, {
  attributes: ['name', 'treatises', 'sequences', 'content']
});

User.register();
