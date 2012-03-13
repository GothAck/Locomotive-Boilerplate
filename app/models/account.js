var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Email = mongoose.SchemaTypes.Email;

var bcrypt = require('bcrypt')
  , crypto = require('crypto');

var AccountSchema = new Schema({
  // eMail address
  email: { type: Email, unique: true, forms_type: 'email', forms: {
    all: {
      type: 'email',
    },
  } },
  confirmed: { type: Boolean, required: true, default: false },

  // Password
  salt: { type: String, required: true },
  hash: { type: String, required: true },

  // Name
  name: {
    first: { type: String, required: true, forms_type: 'string', forms: {
      new: {},
      edit: {}
    } },
    last: { type: String, required: true, forms_type: 'string', forms: {
      new: {},
      edit: {}
    } }
  }
});

AccountSchema.virtual('password', {forms_type: 'password', forms_required: true, forms_confirm: true, forms: {
  all: {
    type: 'password',
    required: true,
  },
  new: {
    confirm: true
  },
  edit: {
    confirm: true,
    existing: true
  }
}}).get(function () {
  return this._password;
}).set(function (password) {
  this._password = password;
  var salt = this.salt = bcrypt.genSaltSync(10);
  this.hash = bcrypt.hashSync(password, salt);
});

AccountSchema.method('checkPassword', function (password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

AccountSchema.virtual('confirmation_hash').get(function () {
  if (this.confirmed) return null;
  var shasum = crypto.createHash('sha1');
  shasum.update(this.email);
  shasum.update(this.salt);
  shasum.update('email_activate');
  return shasum.digest('hex');
});

AccountSchema.static('authenticate', function (email, password, callback) {
  this.findOne({ email: email }, function(err, user) {
    if (err)
      return callback(err);

    if (!user)
      return callback(null, false);
    
    if (!user.confirmed)
      return callback(null, false);

    user.checkPassword(password, function(err, passwordCorrect) {
      if (err)
        return callback(err);

      if (!passwordCorrect)
        return callback(null, false);

      return callback(null, user);
    });
  });
});

module.exports = mongoose.model('Account', AccountSchema);
