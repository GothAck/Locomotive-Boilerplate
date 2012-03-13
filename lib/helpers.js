var messages = require('./messages')
  , forms = require('forms-mongoose')
  , fields = forms.fields
  , validators = forms.validators
  , widgets = forms.widgets;

module.exports.dynamic = {
  user: function (req, res) {
    // Returns the current logged in user or false (if returning undefined templates throw reference error)
    return req.user || false;
  },
  route: function (req, res) {
    // Generate a basic route object for use in templates
    var route = {
      // Will be the classname of the controller, not the simplified name
      controller: req._locomotive.controller,
      action: req._locomotive.action,
      route: req.route,
    }
    // Is equal to the simplified name of the controller
    route.viewDir = req._locomotive.app._controllers[route.controller].__viewDir;
    return route
  },
  messages: messages
}
function createCsrf(req) {
  if (req.session && req.session._csrf) {
    return {'_csrf' : fields.string({ value: req.session._csrf, widget: widgets.hidden() })}
  }
  return {}
}
// Override forms library's bind method of any form generated to preserve _csrf value. Errgh!
function overrideBind(form) {
  var bind = form.bind;
  form.bind = function (data) {
    if (form.fields._csrf && form.fields._csrf.value)
      data._csrf = form.fields._csrf.value;
    return bind(data);
  }
  return form;
}
module.exports.dynamic.forms_create = function (req, res) {
  return function (model, form_name) {
    return overrideBind(forms.create(model, createCsrf(req), form_name));
  }
}
module.exports.dynamic.forms_createForm = function (req, res) {
  return function (params) {
    return overrideBind(forms.createForm( params, createCsrf(req)));
  }
}
module.exports.static = {
  forms: forms
}
