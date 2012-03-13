var _ = require('underscore');

module.exports.flatten = function flatten(object, max_depth) {
  if (typeof object !== 'object') return object;
  var copy = {}
  function flat (level, depth, path) {
    //console.log('flat', level, depth, path, max_depth, (depth < max_depth))
    if ((typeof level === 'object') && (max_depth ? (depth < max_depth) : true)) {
      level = _.clone(level);
      for (var key in level) {
        var value = level[key];
        flat (value, depth + 1, ((typeof path === 'string') ? path + '.' : '') + key);
      }
    } else {
      copy[path] = level;
    }
  }
  flat(object, 0);
  return copy
}
