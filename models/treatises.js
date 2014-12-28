'use strict';

var keystone = require('keystone'),
  Types = keystone.Field.Types,
  Treatise;

Treatise = new keystone.List('Treatise', {
  map: {
    name: 'title'
  },
  defaultColumns: 'title, tag, state|20%, author, publishedAt|15%',
  defaultSort: '-createdAt'
});

Treatise.add({
  title: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true,
    initial: true
  },
  copyright: {
    type: Types.Markdown,
    required: true,
    initial: true,
    'default': 'Copyright © 2014. All rights reserved.'
  },
  author: {
    type: Types.Relationship,
    ref: 'User',
    required: true,
    initial: true
  },
  pages: {
    type: Types.Relationship,
    ref: 'Page',
    many: true
  },
  sequences: {
    type: Types.Relationship,
    ref: 'Sequence',
    many: true
  },
  createdAt: {
    type: Date,
    'default': Date.now
  },
  publishedAt: Date,
  state: {
    type: Types.Select,
    options: 'draft, published, archived',
    'default': 'draft'
  },
  visibility: {
    type: Types.Select,
    options: 'public, authenticated, admin-only',
    'default': 'authenticated'
  },
  comments: {
    type: Types.Markdown,
    height: 300
  }
});

Treatise.register();
