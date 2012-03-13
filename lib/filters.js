/*
 * Model -> form converstion
 */

_actions = {
    create: 'new' // Create uses same form as new
  , update: 'edit' // Update uses same form as edit
}

function bs_iterator (name, field) {
  if (field.widget && field.widget.type === 'hidden') return field.widget.toHTML(name, field);
  var label = this.label || name[0].toUpperCase() + name.substr(1).replace('_', ' ');
  var html = '<div class="control-group'
    + (field.error ? ' error' : '')
    + '">'
    + '<label class="control-label" for="'+(field.id || 'id_'+name)+'">'+label+'</label>'
    + '<div class="controls">'
    + field.widget.toHTML(name, field)
    + (field.error ? '<p class="help-block">' + field.error + '</p>' : '')
    + '</div>'
    + '</div>'
  return html
}

module.exports.convertModelForm = function (next) {
  var self = this;
  // Setup form_render helper for view
  this.form_render = function () {
    if (this.form)
      return this.form.toHTML(bs_iterator);
    return '';
  }
  // If controller has _model parameter create form from model based on current action
  if (this._model) {
    this.form = this.forms_create(this._model, _actions[this.__action] || this.__action);
  }
  next();
}
/*
 * Authentication
 */
// If not authenticated redirect to login
module.exports.isAuth = function (next) {
  if (!this.req.isAuthenticated()) {
    this.req.flash('error', 'Please login to perform this action');
    if (this.route.action !== 'logout')
      this.req.session.onLoginRedirect = this.urlFor();
    return this.redirect(this.urlFor({ controller: 'account', action: 'login'}));
  }
  delete this.req.session.onLoginRedirect;
  next();
}
// If authenticated redirect to account#show
module.exports.notAuth = function (next) {
  if (this.req.isAuthenticated()) {
    this.req.flash('error', "You can't perform this action while logged in");
    return this.redirect(this.urlFor({ controller: 'account', action: 'show' }));
  }
  next();
}
