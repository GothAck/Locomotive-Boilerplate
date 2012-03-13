var nodemailer = require('nodemailer')
  , _ = require('underscore');

var transport = nodemailer.createTransport('SMTP', {
    host: 'localhost'
  , port: 10025
});

var defaultOptions = {
    transport: transport
  , from: 'Test Server <noreply@test.com>'
  , subject: 'Test'
  , generateTextFromHTML: true
}

function sendMail (options, callback) {
  options = _.defaults(options, defaultOptions);
  nodemailer.sendMail(options, callback)
}

module.exports = function () {
  return function (req, res, next) {
    req.sendMail = sendMail;
    next();
  }
}
