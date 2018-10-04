/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */

if (!process.env.NODE_ENV) {
  process.env.BABEL_ENV = 'development';
  process.env.NODE_ENV = 'development';
} else {
  process.env.BABEL_ENV = process.env.NODE_ENV;
}

const bodyParser = require('body-parser');
const compression = require('compression');
const connectSession = require('connect-session-sequelize');
const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const webpack = require('webpack');

const {LOGIN_ENABLED} = require('../server/config');
const {
  getNetworkInstanceConfig,
  reloadInstanceConfig,
} = require('../server/topology/model');

const {sequelize} = require('../server/models');
const {USER} = require('../server/user/accessRoles');
const topologyPeriodic = require('../server/topology/periodic');
const highAvailabilityPeriodic = require('../server/highAvailability/periodic');
const {runMigrations} = require('./runMigrations');
const logger = require('../server/log')(module);

import access from '../server/middleware/access';

const devMode = process.env.NODE_ENV !== 'production';
const port = process.env.PORT ? process.env.PORT : 80;
const sessionSecret = process.env.SESSION_TOKEN || 'TyfiBmZtxU';

const app = express();

app.use(bodyParser.json({limit: '1mb'})); // parse json
app.use(bodyParser.urlencoded({limit: '1mb', extended: false})); // parse application/x-www-form-urlencoded
app.use(cookieParser());
app.use(compression());

// Create Sequelize Store
const SequelizeStore = connectSession(session.Store);
const store = new SequelizeStore({db: sequelize});
app.use(
  session({
    // Used to sign the session cookie
    resave: false,
    secret: sessionSecret,
    saveUninitialized: true,
    unset: 'destroy',
    store,
  }),
);

// Create/Sync Sequelize Session Table
store.sync();

// Initialize Passport
require('../server/user/passportSetup');
app.use(passport.initialize());
app.use(passport.session());

// Views
app.set('views', './views');
app.set('view engine', 'pug');

// Routes
app.use(access(USER));
app.use('/static', express.static(path.join(__dirname, '..', 'static')));
app.use('/apiservice', require('../server/apiservice/routes'));
app.use('/controller', require('../server/controller/routes'));
app.use('/dashboards', require('../server/dashboard/routes'));
app.use('/docker', require('../server/docker/routes'));
app.use('/highavailability', require('../server/highAvailability/routes'));
app.use('/map', require('../server/map/routes'));
app.use('/metrics', require('../server/metrics/routes'));
app.use('/topology', require('../server/topology/routes'));
app.use('/user', require('../server/user/routes'));

// First-time stuff
reloadInstanceConfig();
topologyPeriodic.startPeriodicTasks();
highAvailabilityPeriodic.startPeriodicTasks();

if (devMode) {
  // serve developer, non-minified build
  const config = require('../config/webpack.config.js');
  const compiler = webpack(config);
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    logger,
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  });
  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
} else {
  // serve js from dist/ in prod mode
  app.get('/map.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/map.js'));
  });
}

// Catch All
app.get('*', (req, res) => {
  res.render('index', {
    configJson: JSON.stringify(getNetworkInstanceConfig()),
    userJson: JSON.stringify(req.user),
  });
});

(async function main() {
  // Run DB migrations
  try {
    await runMigrations();
  } catch (error) {
    logger.error('Unable to run migrations:', error);
  }

  app.listen(port, '', err => {
    if (err) {
      logger.error(err);
    }
    if (devMode) {
      logger.info('<=========== DEVELOPER MODE ===========>');
    } else {
      logger.info('<=========== PRODUCTION MODE ==========>');
      logger.info('<== JS BUNDLE SERVED FROM /static/js ==>');
      logger.info('<==== LOCAL CHANGES NOT POSSIBLE ======>');
    }
    logger.info('=========> LISTENING ON PORT %s', port);
  });
})();
