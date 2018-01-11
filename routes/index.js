'use strict';

/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone'),
	middleware = require('./middleware'),
	importRoutes = keystone.importer(__dirname),
  auth = require('../lib/ensure-authed'),
  admin = [auth, require('../lib/ensure-admin')];

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
  api: importRoutes('./api')
};

// Setup Route Bindings
exports = module.exports = function(app) {

	// Views
	app.get('/', routes.views.index);
  app.get('/sequences/:sequenceId', routes.views.sequence);

  app.post('/api/signin', routes.api.signin);
  app.get('/api/signout', routes.api.signout);
  app.get('/api/me', routes.api.me.index);
  app.post('/api/me', auth, routes.api.me.update);

  app.get('/api/treatises', auth, routes.api.treatises);
  app.get('/api/treatises/:id', auth, routes.api.treatise);

  app.get('/api/pages/:id', auth, routes.api.page);

  app.put('/api/sections/:id', auth, routes.api.sections.update);
  app.get('/api/sections/:id', auth, routes.api.sections.show);

  app.get('/api/sequences', auth, routes.api.sequences.index);
  app.post('/api/sequences', auth, routes.api.sequences.create);
  app.get('/api/sequences/:sequenceId', auth, routes.api.sequences.show);
  app['delete']('/api/sequences/:sequenceId', auth, routes.api.sequences['delete']);

  app.post('/api/sequences/:sequenceId/items/:sectionId', admin, routes.api.sequences.items.create);
  app.put('/api/sequences/:sequenceId/items/:sectionId', admin, routes.api.sequences.items.update);
  app['delete']('/api/sequences/:sequenceId/items/:sectionId', admin, routes.api.sequences.items['delete']);

  app.get('*', auth, function(req, res) {
    res.send('Helloo');
  });
};
