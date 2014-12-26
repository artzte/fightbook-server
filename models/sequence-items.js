var keystone = require('keystone'),
  Types = keystone.Field.Types,
  SequenceItem;

SequenceItem = new keystone.List('SequenceItem', {
  defaultColumns: 'title, state|20%, author, publishedAt|15%',
  defaultSort: '-createdAt',
  map: {
    name: 'title'
  }
});

SequenceItem.add({
  title: {
    type: String
  },

  commentary: {
    type: Types.Markdown,
    height: 300
  },

  sequence: {
    type: Types.Relationship,
    ref: 'Sequence'
  },

  page: {
    type: Types.Relationship,
    ref: 'Page'
  },

  section: {
    type: Types.Relationship,
    ref: 'Section'
  },

  createdAt: {
    type: Date,
    'default': Date.now
  }
});

SequenceItem.register();
