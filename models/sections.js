'use strict';

var keystone = require('keystone'),
  addJsonTransform = require('../lib/add-json-transform'),
  Types = keystone.Field.Types,
  Section;

Section = new keystone.List('Section', {
  map: {
    name: 'id'
  },
  sortable: true,
  defaultSort: 'page.title',
  defaultColumns: 'id, page, sortOrder',
  autokey: {
    path: 'slug',
    from: 'title'
  }
});

Section.add({
  state: {
    type: Types.Select,
    options: 'draft, published, archived',
    'default': 'draft'
  },
  page: {
    type: Types.Relationship,
    ref: 'Page'
  },
  sequenceItems: {
    type: Types.Relationship,
    ref: 'SequenceItem',
    many: true
  },
  index: {
    type: Number,
    'default': 0
  },
  // TODO: why this in addition to index?
  sortOrder: {
    type: Number,
    'default': 0
  },
  createdAt: {
    type: Date,
    'default': Date.now
  },
  publishedAt: {
    type: Date
  },
  bounds: {
    x: {
      type: Types.Number
    },
    y: {
      type: Types.Number
    },
    width: {
      type: Types.Number
    },
    height: {
      type: Types.Number
    }
  },
  physicalBounds: {
    x: {
      type: Types.Number
    },
    y: {
      type: Types.Number
    },
    width: {
      type: Types.Number
    },
    height: {
      type: Types.Number
    }
  },
  translation: {
    type: Types.Markdown,
    height: 300
  }
});

addJsonTransform(Section.schema, {
  exclusions: ['author','slug','index']
});

Section.register();
