/* global db */
/* global ObjectId */
var objectId = ObjectId;
db.users.update({canAccessKeystone: true}, {$set: {isAdmin: true}}, {multi: true});
db.treatises.update({title: 'Fior di battaglia'}, {$unset: {author: ''}});
db.treatises.update({title: 'Fior di battaglia'}, {$set: {author: objectId('53b581256f794bb17afd05aa')}});
