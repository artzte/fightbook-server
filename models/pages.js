var keystone = require('keystone'),
  Types = keystone.Field.Types,
  Page;

Page = new keystone.List('Page', {
  autokey: {
    path: 'slug',
    from: 'title',
    unique: true
  },
  sortable: true,
  map: {
    name: 'title'
  },
  defaultColumns: 'title, treatise, state|20%, publishedAt|15%',
  defaultSort: 'treatise'
});

Page.add({
  title: {
    type: String,
    required: true
  },
  state: {
    type: Types.Select,
    options: 'draft, published, archived',
    'default': 'draft'
  },
  treatise: {
    type: Types.Relationship,
    ref: 'Treatise'
  },
  sections: {
    type: Types.Relationship,
    ref: 'Section',
    many: true
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
  createdAt: {
    type: Date,
    'default': Date.now
  },
  publishedAt: Date,
  visibility: {
    type: Types.Select,
    options: 'public, authenticated, admin-only',
    'default': 'authenticated'
  }
});

Page.schema.pre('save', function(next) {
  if (this.isModified('state') && this.isPublished() && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  return next();
});

Page.register();
