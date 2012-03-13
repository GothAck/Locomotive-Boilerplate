module.exports = function routes() {
  // Title page
  this.root('pages#main');
  // About pages
  this.match('about.:format?', 'about#index');
  this.match('about/:page.:format?', 'about#page');
  // User account pages
  this.resource('account', function () {
    this.match('confirm/:email/:confirmation_hash', 'account#confirm');
    this.match('login.:format?', 'account#loginForm', { via: 'get' });
    this.match('login.:format?', 'account#login', { via: 'post'});
    this.match('logout', 'account#logout');
  });
}
