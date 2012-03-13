var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var AboutController = new Controller();

var pages = {
  contact: 'Contact'
}

AboutController.index = function() {
  this.title = 'About';
  console.log('index', this.req);
  this.render(null, {layout : ( (this.param('format') === 'frag') ? null : undefined ) });
}

AboutController.page = function() {
  var page = this.param('page');
  console.log(this);
  if (!(page in pages)) return this.res.send(404);
  this.title = 'Contact';
  this.render(this.param('page'));
}

module.exports = AboutController;
