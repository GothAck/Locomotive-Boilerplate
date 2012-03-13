module.exports = function () {
  return function (req, res, next) {
    console.log('formatter', req);
    switch (req.param('format')) {
      case 'frag': res.local('layout', false); break;
     }
    next();
  }
}
