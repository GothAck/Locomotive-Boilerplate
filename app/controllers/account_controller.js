var locomotive = require('locomotive')
  , passport = require('passport')
  , Controller = locomotive.Controller
  , filters = require('../../lib/filters')
  , misc = require('../../lib/misc');

var AccountController = new Controller();

AccountController._model = require('../models/account');

/*
 * Show
 */
AccountController.show = function() {
  this.user = this.req.user;
  this.render();
}
AccountController.before('show', filters.isAuth);

/*
 * New
 */
AccountController.new = function () {
  this.render();
}
AccountController.before('new', filters.notAuth);
AccountController.before('new', filters.convertModelForm);

/*
 * Create
 */
AccountController.create = function() {
  var self = this;
  this.form = this.form.bind(this.req.body);
  this.form.validate(function () {
    if (self.form.isValid()) {
      // Create new account object with form data
      if (self.form.data._csrf) delete self.form.data._csrf;
      var account = new self._model(self.form.data);
      // Save account object
      account.save(function (err) {
        if (err) {
          self.req.flash('error', 'An error occured creating your account, have you already signed up?');
          self.render('new');
        } else {
          self.confirmation_hash = account.confirmation_hash;
          self.email = account.email;
          self.render('email/confirm', { layout: 'email' }, function (err, html) {
            if (err) return;
            self.req.sendMail({
                to: account.email
              , subject: 'Activate your account'
              , html: html
            });
          });

          self.req.flash('info', 'Account created, please check your email!');
          self.redirect(self.urlFor({ action: 'login' }));
        }
      });
    } else {
      self.render('new');
    }
  });
};
AccountController.before('create', filters.notAuth);
AccountController.before('create', filters.convertModelForm);

/*
 * Edit
 */
AccountController.edit = function () {
  var user = misc.flatten(this.req.user.toObject(), 2);
  console.log(user);
  this.form = this.form.bind(user);
  // FIXME: Password leak in password.confirm on edit page!!
  this.render();
}
AccountController.before('edit', filters.isAuth);
AccountController.before('edit', filters.convertModelForm);

/*
 * Update
 */
AccountController.update = function () {
  var self = this;
  this.form = this.form.bind(this.req.body);
  this.form.existing = {
    password: function(password, callback) {
      self.req.user.checkPassword(password, callback);
    }
  }
  this.form.validate(function () {
    if (self.form.isValid()) {
      var account = self.req.user;

      account.email = self.param('email');
      account.password = self.param('password');
      account.name.first = self.param('name.first');
      account.name.last = self.param('name.last');

      if (account.isModified('email')) {
        self.req.flash('info', 'Please check your email to confirm your new email address');
        account.confirmed = false;
        self.confirmation_hash = account.confirmation_hash;
        self.email = account.email;
        self.render('email/confirm', {
            callback: function (err, html) {
              if (err) return;
              self.req.sendMail({
                  to: account.email
                , subject: 'Activate your email address'
                , html: html
              });
            }
          , layout: 'email'
        })
      }
      account.save(function (err) {
        if (err) {
          self.req.flash('error', 'There was an error saving your account, please check and try again!');
          self.render('edit');
        } else {
          self.req.flash('info', 'Account updated');
          self.redirect(self.urlFor({action: 'show'}));
        }
      });
    } else {
      self.render('edit');
    }
  });
}
AccountController.before('update', filters.isAuth);
AccountController.before('update', filters.convertModelForm);

/*
 * Confirm
 */
AccountController.confirm = function () {
  var self = this;
  var hash = this.param('confirmation_hash');
  var email = this.param('email');
  this._model.findOne({email: email}, function (err, doc) {
    if (
      err ||
      (!doc) ||
      doc.confirmed ||
      doc.confirmation_hash !== hash
    ) {
      self.req.flash('error', 'Invalid confirmation link.');
      self.redirect(self.urlFor({ action: 'login' }));
    } else {
      doc.confirmed = true;
      doc.save();
      self.req.flash('info', 'Account confirmed, please login!');
      self.redirect(self.urlFor({ action: 'login' }));
    }
  })
}

/*
 * LoginForm
 */
AccountController.loginForm = function () {
  this.render();
}
AccountController.before('loginForm', filters.notAuth);
AccountController.before('loginForm', filters.convertModelForm);

/*
 * Login
 */
AccountController.login = function() {
  var self = this;
  this.form = this.form.bind(this.req.body);
  this.form.validate(function () {
    if (self.form.isValid()) {
      passport.authenticate('local', function (err, user) {
        if (err) return self.error(err);
        if (!user) {
          self.req.flash('error', 'Invalid credentials');
          return self.redirect(self.urlFor({ action: 'login'}));
        }
        self.req._passport.instance.serializeUser(user, function (err, serialized) {
          self.req._passport.session.user = serialized;
          self.redirect(self.req.session.onLoginRedirect || self.urlFor({ action: 'show' }));
        });
      })(self.__req, self.__res, self.__next);
    } else {
      self.render('login_form');
    }
  });
};
AccountController.before('login', filters.notAuth);
AccountController.before('login', filters.convertModelForm);

/*
 * Logout
 */
AccountController.logout = function() {
  this.req.logout();
  this.redirect('/');
};
AccountController.before('logout', filters.isAuth);

module.exports = AccountController;
