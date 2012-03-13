var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongodb');
var crypto = require('crypto');
var helpers = require('../../lib/helpers');

module.exports = function() {
  this.set('views', __dirname + '/../../app/views');
  this.set('view engine', 'ejs');

  this.use(express.logger());
  this.use(express.cookieParser());
  this.use(express.bodyParser());
  this.use(express.methodOverride());
  this.use(express.session({
    secret: 'asdhwhnxxiou1mizxehdncfx3gx',
    store: new mongoStore({db: mongoose.connection.db})
  }));
  this.use(passport.initialize());
  this.use(passport.session());
  this.use(express.csrf(function(req) {
    if (! req.session.csrf_token )
      req.session.csrf_token = crypto.randomBytes(Math.ceil(24 * 3 / 4))
        .toString('base64').slice(0, 24);
    return req.session.csrf_token;
  }));
  this.use(require('../../lib/email_lib')());
  this.use(this.router);
  this.use(express.static(__dirname + '/../../public'));
  
  this.dynamicHelpers(helpers.dynamic);
  this.helpers(helpers.static);
  
  this.datastore(require('locomotive-mongoose'));
}
